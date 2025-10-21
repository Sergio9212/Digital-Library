using DigitalLibrary.API.Models;
using DigitalLibrary.API.Models.DTOs;
using DigitalLibrary.API.Repositories;

namespace DigitalLibrary.API.Services
{
    public interface IBookService
    {
        Task<IEnumerable<BookDto>> GetUserBooksAsync(int userId);
        Task<BookDto?> GetBookByIdAsync(int bookId, int userId);
        Task<BookDto?> CreateBookAsync(CreateBookRequest request, int userId);
        Task<BookDto?> UpdateBookAsync(int bookId, UpdateBookRequest request, int userId);
        Task<bool> DeleteBookAsync(int bookId, int userId);
    }

    public class BookService : IBookService
    {
        private readonly IBookRepository _bookRepository;

        public BookService(IBookRepository bookRepository)
        {
            _bookRepository = bookRepository;
        }

        public async Task<IEnumerable<BookDto>> GetUserBooksAsync(int userId)
        {
            var books = await _bookRepository.GetByUserIdAsync(userId);
            
            return books.Select(b => new BookDto
            {
                Id = b.Id,
                Title = b.Title,
                Author = b.Author,
                Year = b.Year,
                CoverImageUrl = b.CoverImageUrl,
                Rating = b.Rating,
                Review = b.Review,
                UserId = b.UserId
            });
        }

        public async Task<BookDto?> GetBookByIdAsync(int bookId, int userId)
        {
            var book = await _bookRepository.GetByIdAsync(bookId);
            
            if (book == null || book.UserId != userId)
                return null;

            return new BookDto
            {
                Id = book.Id,
                Title = book.Title,
                Author = book.Author,
                Year = book.Year,
                CoverImageUrl = book.CoverImageUrl,
                Rating = book.Rating,
                Review = book.Review,
                UserId = book.UserId
            };
        }

        public async Task<BookDto?> CreateBookAsync(CreateBookRequest request, int userId)
        {
            var book = new Book
            {
                Title = request.Title,
                Author = request.Author,
                Year = request.Year,
                CoverImageUrl = request.CoverImageUrl,
                Rating = request.Rating,
                Review = request.Review,
                UserId = userId
            };

            var createdBook = await _bookRepository.CreateAsync(book);

            return new BookDto
            {
                Id = createdBook.Id,
                Title = createdBook.Title,
                Author = createdBook.Author,
                Year = createdBook.Year,
                CoverImageUrl = createdBook.CoverImageUrl,
                Rating = createdBook.Rating,
                Review = createdBook.Review,
                UserId = createdBook.UserId
            };
        }

        public async Task<BookDto?> UpdateBookAsync(int bookId, UpdateBookRequest request, int userId)
        {
            // Verificar que el libro pertenece al usuario
            if (!await _bookRepository.BelongsToUserAsync(bookId, userId))
                return null;

            var book = await _bookRepository.GetByIdAsync(bookId);
            if (book == null)
                return null;

            // Actualizar solo los campos proporcionados
            if (request.Title != null)
                book.Title = request.Title;
            if (request.Author != null)
                book.Author = request.Author;
            if (request.Year.HasValue)
                book.Year = request.Year.Value;
            if (request.CoverImageUrl != null)
                book.CoverImageUrl = request.CoverImageUrl;
            if (request.Rating.HasValue)
                book.Rating = request.Rating.Value;
            if (request.Review != null)
                book.Review = request.Review;

            var updatedBook = await _bookRepository.UpdateAsync(book);

            return new BookDto
            {
                Id = updatedBook.Id,
                Title = updatedBook.Title,
                Author = updatedBook.Author,
                Year = updatedBook.Year,
                CoverImageUrl = updatedBook.CoverImageUrl,
                Rating = updatedBook.Rating,
                Review = updatedBook.Review,
                UserId = updatedBook.UserId
            };
        }

        public async Task<bool> DeleteBookAsync(int bookId, int userId)
        {
            // Verificar que el libro pertenece al usuario
            if (!await _bookRepository.BelongsToUserAsync(bookId, userId))
                return false;

            return await _bookRepository.DeleteAsync(bookId);
        }
    }
}