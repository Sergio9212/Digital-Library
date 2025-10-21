using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DigitalLibrary.API.Models
{
    public class Book
    {
        public int Id { get; set; }
        
        [Required]
        [StringLength(200)]
        public string Title { get; set; } = string.Empty;
        
        [Required]
        [StringLength(200)]
        public string Author { get; set; } = string.Empty;
        
        [Required]
        [Range(1000, 3000)]
        public int Year { get; set; }
        
        [StringLength(500)]
        public string? CoverImageUrl { get; set; }
        
        [Range(1, 5)]
        public int Rating { get; set; }
        
        [StringLength(2000)]
        public string? Review { get; set; }
        
        [Required]
        public int UserId { get; set; }
        
        // Navigation property
        [ForeignKey("UserId")]
        public virtual User User { get; set; } = null!;
    }
}
