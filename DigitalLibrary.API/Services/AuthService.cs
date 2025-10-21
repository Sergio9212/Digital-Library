using DigitalLibrary.API.Models;
using DigitalLibrary.API.Models.DTOs;
using DigitalLibrary.API.Repositories;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;

namespace DigitalLibrary.API.Services
{
    public interface IAuthService
    {
        Task<AuthResponse?> LoginAsync(LoginRequest request);
        Task<AuthResponse?> RegisterAsync(RegisterRequest request);
        string GenerateJwtToken(User user);
        Task<(AuthResponse? result, string? errorType)> LoginWithErrorTypeAsync(LoginRequest request);
        Task<UserDto?> UpdateProfileAsync(int userId, UpdateProfileRequest request);
        Task<bool> ChangePasswordAsync(int userId, ChangePasswordRequest request);
        Task<bool> DeleteAccountAsync(int userId, DeleteAccountRequest request);
    }

    public class AuthService : IAuthService
    {
        private readonly IUserRepository _userRepository;
        private readonly IConfiguration _configuration;

        public AuthService(IUserRepository userRepository, IConfiguration configuration)
        {
            _userRepository = userRepository;
            _configuration = configuration;
        }

        public async Task<(AuthResponse? result, string? errorType)> LoginWithErrorTypeAsync(LoginRequest request)
        {
            var user = await _userRepository.GetByEmailAsync(request.Email);

            if (user == null)
            {
                return (null, "USER_NOT_FOUND");
            }

            if (!VerifyPassword(request.Password, user.PasswordHash))
            {
                return (null, "INVALID_PASSWORD");
            }

            var token = GenerateJwtToken(user);
            var userDto = new UserDto
            {
                Id = user.Id,
                Nombre = user.Nombre,
                Apellido = user.Apellido,
                Email = user.Email
            };

            var authResponse = new AuthResponse
            {
                Token = token,
                User = userDto
            };

            return (authResponse, null);
        }

        public async Task<AuthResponse?> LoginAsync(LoginRequest request)
        {
            var (result, _) = await LoginWithErrorTypeAsync(request);
            return result;
        }

        public async Task<AuthResponse?> RegisterAsync(RegisterRequest request)
        {
            // Check if user already exists
            if (await _userRepository.ExistsByEmailAsync(request.Email))
            {
                return null;
            }

            var user = new User
            {
                Nombre = request.Nombre,
                Apellido = request.Apellido,
                Email = request.Email,
                PasswordHash = HashPassword(request.Password)
            };

            await _userRepository.CreateAsync(user);

            var token = GenerateJwtToken(user);
            var userDto = new UserDto
            {
                Id = user.Id,
                Nombre = user.Nombre,
                Apellido = user.Apellido,
                Email = user.Email
            };

            return new AuthResponse
            {
                Token = token,
                User = userDto
            };
        }

        public string GenerateJwtToken(User user)
        {
            var jwtSettings = _configuration.GetSection("JwtSettings");
            var secretKey = jwtSettings["SecretKey"] ?? "YourSuperSecretKeyThatIsAtLeast32CharactersLong!";
            var issuer = jwtSettings["Issuer"] ?? "DigitalLibrary";
            var audience = jwtSettings["Audience"] ?? "DigitalLibraryUsers";
            var expiryMinutes = int.Parse(jwtSettings["ExpiryMinutes"] ?? "60");

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Name, $"{user.Nombre} {user.Apellido}"),
                new Claim("userId", user.Id.ToString())
            };

            var token = new JwtSecurityToken(
                issuer: issuer,
                audience: audience,
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(expiryMinutes),
                signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        private string HashPassword(string password)
        {
            using var rng = RandomNumberGenerator.Create();
            var salt = new byte[16];
            rng.GetBytes(salt);

            using var pbkdf2 = new Rfc2898DeriveBytes(password, salt, 10000, HashAlgorithmName.SHA256);
            var hash = pbkdf2.GetBytes(32);

            var hashBytes = new byte[48];
            Array.Copy(salt, 0, hashBytes, 0, 16);
            Array.Copy(hash, 0, hashBytes, 16, 32);

            return Convert.ToBase64String(hashBytes);
        }

        private bool VerifyPassword(string password, string passwordHash)
        {
            try
            {
                var hashBytes = Convert.FromBase64String(passwordHash);
                var salt = new byte[16];
                Array.Copy(hashBytes, 0, salt, 0, 16);

                using var pbkdf2 = new Rfc2898DeriveBytes(password, salt, 10000, HashAlgorithmName.SHA256);
                var hash = pbkdf2.GetBytes(32);

                for (int i = 0; i < 32; i++)
                {
                    if (hashBytes[i + 16] != hash[i])
                        return false;
                }
                return true;
            }
            catch
            {
                return false;
            }
        }

        public async Task<UserDto?> UpdateProfileAsync(int userId, UpdateProfileRequest request)
        {
            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null) return null;

            // Verificar si el email ya existe en otro usuario
            var existingUser = await _userRepository.GetByEmailAsync(request.Email);
            if (existingUser != null && existingUser.Id != userId)
            {
                return null;
            }

            user.Nombre = request.Nombre;
            user.Apellido = request.Apellido;
            user.Email = request.Email;

            await _userRepository.UpdateAsync(user);

            return new UserDto
            {
                Id = user.Id,
                Nombre = user.Nombre,
                Apellido = user.Apellido,
                Email = user.Email
            };
        }

        public async Task<bool> ChangePasswordAsync(int userId, ChangePasswordRequest request)
        {
            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null) return false;

            // Verificar contraseña actual
            if (!VerifyPassword(request.CurrentPassword, user.PasswordHash))
            {
                return false;
            }

            // Actualizar contraseña
            user.PasswordHash = HashPassword(request.NewPassword);
            await _userRepository.UpdateAsync(user);

            return true;
        }

        public async Task<bool> DeleteAccountAsync(int userId, DeleteAccountRequest request)
        {
            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null) return false;

            // Verificar contraseña
            if (!VerifyPassword(request.Password, user.PasswordHash))
            {
                return false;
            }

            // Eliminar usuario (los libros se eliminan por cascada)
            return await _userRepository.DeleteAsync(userId);
        }
    }
}
