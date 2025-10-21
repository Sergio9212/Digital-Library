using DigitalLibrary.API.Data;
using DigitalLibrary.API.Models.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace DigitalLibrary.API.Controllers
{
    /// <summary>
    /// 👥 Controlador de Usuarios
    /// 
    /// Maneja todas las operaciones relacionadas con la gestión de usuarios,
    /// incluyendo perfiles, cambio de contraseñas y eliminación de cuentas.
    /// Requiere autenticación JWT para acceder a todos los endpoints.
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    [Produces("application/json")]
    public class UsersController : ControllerBase
    {
        private readonly DigitalLibraryContext _context;
        private readonly ILogger<UsersController> _logger;

        public UsersController(DigitalLibraryContext context, ILogger<UsersController> logger)
        {
            _context = context;
            _logger = logger;
        }

        /// <summary>
        /// 👥 Obtener Todos los Usuarios
        /// </summary>
        /// <remarks>
        /// Recupera una lista de todos los usuarios registrados en el sistema.
        /// 
        /// **Funcionalidad:**
        /// - Obtiene información básica de todos los usuarios
        /// - Incluye ID, nombre, apellido y email
        /// - Excluye información sensible como contraseñas
        /// - Útil para administración del sistema
        /// 
        /// **Información incluida:**
        /// - ID único del usuario
        /// - Nombre y apellido
        /// - Email de contacto
        /// - Sin información de contraseñas
        /// 
        /// **Autenticación requerida:** Sí (JWT Token)
        /// 
        /// **Ejemplo de respuesta:**
        /// ```json
        /// [
        ///   {
        ///     "id": 1,
        ///     "nombre": "Juan",
        ///     "apellido": "Pérez",
        ///     "email": "juan@email.com"
        ///   },
        ///   {
        ///     "id": 2,
        ///     "nombre": "María",
        ///     "apellido": "García",
        ///     "email": "maria@email.com"
        ///   }
        /// ]
        /// ```
        /// </remarks>
        /// <returns>Lista de usuarios registrados</returns>
        /// <response code="200">Lista de usuarios obtenida exitosamente</response>
        /// <response code="401">Token JWT inválido o expirado</response>
        /// <response code="500">Error interno del servidor</response>
        [HttpGet]
        [ProducesResponseType(typeof(IEnumerable<UserDto>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetUsers()
        {
            try
            {
                var users = await _context.Users
                    .Select(u => new UserDto
                    {
                        Id = u.Id,
                        Nombre = u.Nombre,
                        Apellido = u.Apellido,
                        Email = u.Email
                    })
                    .ToListAsync();

                return Ok(users);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener usuarios");
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// Obtiene un usuario por ID
        /// </summary>
        /// <param name="id">ID del usuario</param>
        /// <returns>Datos del usuario</returns>
        [HttpGet("{id}")]
        [ProducesResponseType(typeof(UserDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetUser(int id)
        {
            try
            {
                var user = await _context.Users
                    .Where(u => u.Id == id)
                    .Select(u => new UserDto
                    {
                        Id = u.Id,
                        Nombre = u.Nombre,
                        Apellido = u.Apellido,
                        Email = u.Email
                    })
                    .FirstOrDefaultAsync();

                if (user == null)
                {
                    return NotFound(new { message = "Usuario no encontrado" });
                }

                return Ok(user);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener usuario {UserId}", id);
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// Actualiza un usuario
        /// </summary>
        /// <param name="id">ID del usuario</param>
        /// <param name="request">Datos actualizados del usuario</param>
        /// <returns>Usuario actualizado</returns>
        [HttpPut("{id}")]
        [ProducesResponseType(typeof(UserDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> UpdateUser(int id, [FromBody] UpdateUserRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var user = await _context.Users.FindAsync(id);
                if (user == null)
                {
                    return NotFound(new { message = "Usuario no encontrado" });
                }

                // Verificar que el usuario solo pueda actualizar su propio perfil
                var currentUserId = GetCurrentUserId();
                if (currentUserId != id)
                {
                    return Forbid();
                }

                if (request.Nombre != null)
                    user.Nombre = request.Nombre;
                if (request.Apellido != null)
                    user.Apellido = request.Apellido;
                if (request.Email != null)
                    user.Email = request.Email;

                await _context.SaveChangesAsync();

                var userDto = new UserDto
                {
                    Id = user.Id,
                    Nombre = user.Nombre,
                    Apellido = user.Apellido,
                    Email = user.Email
                };

                return Ok(userDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al actualizar usuario {UserId}", id);
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// Elimina un usuario
        /// </summary>
        /// <param name="id">ID del usuario</param>
        /// <returns>Resultado de la operación</returns>
        [HttpDelete("{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> DeleteUser(int id)
        {
            try
            {
                var user = await _context.Users.FindAsync(id);
                if (user == null)
                {
                    return NotFound(new { message = "Usuario no encontrado" });
                }

                // Verificar que el usuario solo pueda eliminar su propio perfil
                var currentUserId = GetCurrentUserId();
                if (currentUserId != id)
                {
                    return Forbid();
                }

                _context.Users.Remove(user);
                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al eliminar usuario {UserId}", id);
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        private int GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst("userId")?.Value;
            return int.TryParse(userIdClaim, out var userId) ? userId : 0;
        }
    }

    public class UpdateUserRequest
    {
        public string? Nombre { get; set; }
        public string? Apellido { get; set; }
        public string? Email { get; set; }
    }
}
