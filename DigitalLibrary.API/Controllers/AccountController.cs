using DigitalLibrary.API.Models.DTOs;
using DigitalLibrary.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace DigitalLibrary.API.Controllers
{
    /// <summary>
    /// Controlador para la gestión de cuenta del usuario autenticado.
    /// Requiere autenticación JWT.
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class AccountController : ControllerBase
    {
        private readonly IAuthService _authService;
        private readonly ILogger<AccountController> _logger;

        public AccountController(IAuthService authService, ILogger<AccountController> logger)
        {
            _authService = authService;
            _logger = logger;
        }

        /// <summary>
        /// Actualiza el perfil del usuario autenticado.
        /// </summary>
        /// <param name="request">Datos actualizados del perfil.</param>
        /// <returns>Perfil actualizado.</returns>
        [HttpPut("profile")]
        [ProducesResponseType(typeof(UserDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var userId = GetCurrentUserId();
                if (userId == 0) return Unauthorized(new { message = "Usuario no autenticado o ID inválido." });

                var updatedUser = await _authService.UpdateProfileAsync(userId, request);
                if (updatedUser == null)
                {
                    return BadRequest(new { message = "El email ya está registrado por otro usuario." });
                }

                return Ok(updatedUser);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al actualizar perfil del usuario {UserId}", GetCurrentUserId());
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// Cambia la contraseña del usuario autenticado.
        /// </summary>
        /// <param name="request">Datos para cambio de contraseña.</param>
        /// <returns>Resultado del cambio de contraseña.</returns>
        [HttpPut("password")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var userId = GetCurrentUserId();
                if (userId == 0) return Unauthorized(new { message = "Usuario no autenticado o ID inválido." });

                var success = await _authService.ChangePasswordAsync(userId, request);
                if (!success)
                {
                    return BadRequest(new { message = "La contraseña actual es incorrecta." });
                }

                return Ok(new { message = "Contraseña actualizada exitosamente." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al cambiar contraseña del usuario {UserId}", GetCurrentUserId());
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// Elimina la cuenta del usuario autenticado.
        /// </summary>
        /// <param name="request">Datos para eliminación de cuenta.</param>
        /// <returns>Resultado de la eliminación de cuenta.</returns>
        [HttpDelete("account")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> DeleteAccount([FromBody] DeleteAccountRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var userId = GetCurrentUserId();
                if (userId == 0) return Unauthorized(new { message = "Usuario no autenticado o ID inválido." });

                var success = await _authService.DeleteAccountAsync(userId, request);
                if (!success)
                {
                    return BadRequest(new { message = "La contraseña es incorrecta." });
                }

                return Ok(new { message = "Cuenta eliminada exitosamente." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al eliminar cuenta del usuario {UserId}", GetCurrentUserId());
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        private int GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst("userId")?.Value;
            return int.TryParse(userIdClaim, out var userId) ? userId : 0;
        }
    }
}
