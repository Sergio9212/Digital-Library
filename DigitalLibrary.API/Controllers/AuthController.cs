using DigitalLibrary.API.Models.DTOs;
using DigitalLibrary.API.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace DigitalLibrary.API.Controllers
{
    /// <summary>
    /// 🔐 Controlador de Autenticación
    /// 
    /// Maneja todas las operaciones relacionadas con la autenticación de usuarios,
    /// incluyendo registro, inicio de sesión y generación de tokens JWT.
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    [Produces("application/json")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;
        private readonly ILogger<AuthController> _logger;
        private readonly IConfiguration _configuration;

        public AuthController(IAuthService authService, ILogger<AuthController> logger, IConfiguration configuration)
        {
            _authService = authService;
            _logger = logger;
            _configuration = configuration;
        }

        /// <summary>
        /// 📝 Registrar Nuevo Usuario
        /// </summary>
        /// <remarks>
        /// Crea una nueva cuenta de usuario en el sistema y devuelve un token JWT para autenticación.
        /// 
        /// **Funcionalidad:**
        /// - Valida que el email no esté registrado previamente
        /// - Encripta la contraseña usando Rfc2898DeriveBytes
        /// - Genera un token JWT con información del usuario
        /// - Almacena los datos del usuario en la base de datos
        /// 
        /// **Validaciones:**
        /// - Email debe ser único y válido
        /// - Contraseña debe tener al menos 6 caracteres
        /// - Nombre y apellido son obligatorios
        /// 
        /// **Ejemplo de solicitud:**
        /// ```json
        /// {
        ///   "nombre": "Juan",
        ///   "apellido": "Pérez",
        ///   "email": "juan@email.com",
        ///   "password": "miPassword123"
        /// }
        /// ```
        /// 
        /// **Ejemplo de respuesta exitosa:**
        /// ```json
        /// {
        ///   "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        ///   "user": {
        ///     "id": 1,
        ///     "nombre": "Juan",
        ///     "apellido": "Pérez",
        ///     "email": "juan@email.com"
        ///   }
        /// }
        /// ```
        /// </remarks>
        /// <param name="request">Datos del usuario a registrar</param>
        /// <returns>Token JWT y datos del usuario registrado</returns>
        /// <response code="200">Usuario registrado exitosamente</response>
        /// <response code="400">Datos de entrada inválidos o email ya existe</response>
        /// <response code="500">Error interno del servidor</response>
        [HttpPost("register")]
        [ProducesResponseType(typeof(AuthResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> Register([FromBody] RegisterRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var result = await _authService.RegisterAsync(request);
                if (result == null)
                {
                    return BadRequest(new { message = "El email ya está registrado" });
                }

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al registrar usuario");
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// 🔑 Iniciar Sesión
        /// </summary>
        /// <remarks>
        /// Autentica un usuario existente y devuelve un token JWT para acceder a endpoints protegidos.
        /// 
        /// **Funcionalidad:**
        /// - Verifica las credenciales del usuario (email y contraseña)
        /// - Compara la contraseña encriptada con la almacenada
        /// - Genera un token JWT válido por 24 horas
        /// - Devuelve información básica del usuario autenticado
        /// 
        /// **Validaciones:**
        /// - Email debe existir en la base de datos
        /// - Contraseña debe coincidir con la almacenada
        /// - Usuario debe estar activo
        /// 
        /// **Uso del Token:**
        /// - Incluir en header: `Authorization: Bearer {token}`
        /// - Token válido por 24 horas
        /// - Requerido para todos los endpoints protegidos
        /// 
        /// **Ejemplo de solicitud:**
        /// ```json
        /// {
        ///   "email": "juan@email.com",
        ///   "password": "miPassword123"
        /// }
        /// ```
        /// 
        /// **Ejemplo de respuesta exitosa:**
        /// ```json
        /// {
        ///   "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        ///   "user": {
        ///     "id": 1,
        ///     "nombre": "Juan",
        ///     "apellido": "Pérez",
        ///     "email": "juan@email.com"
        ///   }
        /// }
        /// ```
        /// 
        /// **Posibles errores:**
        /// - `400`: Datos de entrada inválidos
        /// - `401`: Credenciales incorrectas (usuario no encontrado o contraseña incorrecta)
        /// </remarks>
        /// <param name="request">Credenciales de login (email y contraseña)</param>
        /// <returns>Token JWT y datos del usuario autenticado</returns>
        /// <response code="200">Login exitoso</response>
        /// <response code="400">Datos de entrada inválidos</response>
        /// <response code="401">Credenciales incorrectas</response>
        /// <response code="500">Error interno del servidor</response>
        [HttpPost("login")]
        [ProducesResponseType(typeof(AuthResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var (result, errorType) = await _authService.LoginWithErrorTypeAsync(request);
                if (result == null)
                {
                    var errorMessage = errorType switch
                    {
                        "USER_NOT_FOUND" => "No existe una cuenta con este email",
                        "INVALID_PASSWORD" => "La contraseña es incorrecta",
                        _ => "Credenciales inválidas"
                    };

                    return Unauthorized(new { message = errorMessage });
                }

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al iniciar sesión");
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        private string GenerateJwtToken(string email, string name, string userId)
        {
            var jwtSettings = _configuration.GetSection("JwtSettings");
            var secretKey = jwtSettings["SecretKey"] ?? "YourSuperSecretKeyThatIsAtLeast32CharactersLong!";
            var issuer = jwtSettings["Issuer"] ?? "DigitalLibrary";
            var audience = jwtSettings["Audience"] ?? "DigitalLibraryUsers";

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(ClaimTypes.Email, email),
                new Claim(ClaimTypes.Name, name),
                new Claim(ClaimTypes.NameIdentifier, userId),
                new Claim("userId", userId),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
            };

            var token = new JwtSecurityToken(
                issuer: issuer,
                audience: audience,
                claims: claims,
                expires: DateTime.UtcNow.AddHours(24),
                signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
