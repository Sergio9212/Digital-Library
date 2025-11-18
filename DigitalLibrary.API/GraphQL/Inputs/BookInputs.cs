using System.ComponentModel.DataAnnotations;

namespace DigitalLibrary.API.GraphQL.Inputs
{
    /// <summary>
    /// Input para crear un libro vía GraphQL.
    /// </summary>
    public class CreateBookInput
    {
        [Required, MaxLength(200)]
        public string Title { get; set; } = string.Empty;

        [Required, MaxLength(200)]
        public string Author { get; set; } = string.Empty;

        [Range(1000, 3000)]
        public int Year { get; set; }

        [Range(1, 5)]
        public int Rating { get; set; }

        [MaxLength(2000)]
        public string? Review { get; set; }

        [MaxLength(500)]
        public string? CoverImageUrl { get; set; }
    }

    /// <summary>
    /// Input para actualizar un libro existente vía GraphQL.
    /// </summary>
    public class UpdateBookInput
    {
        [MaxLength(200)]
        public string? Title { get; set; }

        [MaxLength(200)]
        public string? Author { get; set; }

        [Range(1000, 3000)]
        public int? Year { get; set; }

        [Range(1, 5)]
        public int? Rating { get; set; }

        [MaxLength(2000)]
        public string? Review { get; set; }

        [MaxLength(500)]
        public string? CoverImageUrl { get; set; }
    }
}

