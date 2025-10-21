using System.ComponentModel.DataAnnotations;

namespace DigitalLibrary.API.Models.DTOs
{
    public class UpdateProfileRequest
    {
        [Required]
        [StringLength(100)]
        public string Nombre { get; set; } = string.Empty;
        
        [Required]
        [StringLength(100)]
        public string Apellido { get; set; } = string.Empty;
        
        [Required]
        [EmailAddress]
        [StringLength(255)]
        public string Email { get; set; } = string.Empty;
    }

    public class ChangePasswordRequest
    {
        [Required]
        public string CurrentPassword { get; set; } = string.Empty;
        
        [Required]
        [MinLength(6)]
        public string NewPassword { get; set; } = string.Empty;
    }

    public class DeleteAccountRequest
    {
        [Required]
        public string Password { get; set; } = string.Empty;
    }
}
