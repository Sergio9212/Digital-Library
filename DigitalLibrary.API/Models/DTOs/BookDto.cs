namespace DigitalLibrary.API.Models.DTOs
{
    public class CreateBookRequest
    {
        public string Title { get; set; } = string.Empty;
        public string Author { get; set; } = string.Empty;
        public int Year { get; set; }
        public int Rating { get; set; }
        public string Review { get; set; } = string.Empty;
        public string CoverImageUrl { get; set; } = string.Empty;
    }

    public class UpdateBookRequest
    {
        public string? Title { get; set; }
        public string? Author { get; set; }
        public int? Year { get; set; }
        public int? Rating { get; set; }
        public string? Review { get; set; }
        public string? CoverImageUrl { get; set; }
    }

    public class BookDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Author { get; set; } = string.Empty;
        public int Year { get; set; }
        public int Rating { get; set; }
        public string? Review { get; set; }
        public string? CoverImageUrl { get; set; }
        public int UserId { get; set; }
    }
}