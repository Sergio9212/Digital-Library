using DigitalLibrary.API.Data;
using DigitalLibrary.API.Models;
using Microsoft.EntityFrameworkCore;

namespace DigitalLibrary.API.Repositories
{
    /// <summary>
    /// Implementación del repositorio de libros
    /// </summary>
    public class BookRepository : IBookRepository
    {
        private readonly DigitalLibraryContext _context;

        public BookRepository(DigitalLibraryContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Obtiene un libro por su ID
        /// </summary>
        public async Task<Book?> GetByIdAsync(int id)
        {
            return await _context.Books
                .Include(b => b.User)
                .FirstOrDefaultAsync(b => b.Id == id);
        }

        /// <summary>
        /// Obtiene todos los libros de un usuario específico
        /// </summary>
        public async Task<IEnumerable<Book>> GetByUserIdAsync(int userId)
        {
            return await _context.Books
                .Where(b => b.UserId == userId)
                .OrderByDescending(b => b.Id)
                .ToListAsync();
        }

        /// <summary>
        /// Obtiene todos los libros (para administración)
        /// </summary>
        public async Task<IEnumerable<Book>> GetAllAsync()
        {
            return await _context.Books
                .Include(b => b.User)
                .OrderByDescending(b => b.Id)
                .ToListAsync();
        }

        /// <summary>
        /// Crea un nuevo libro
        /// </summary>
        public async Task<Book> CreateAsync(Book book)
        {
            _context.Books.Add(book);
            await _context.SaveChangesAsync();
            return book;
        }

        /// <summary>
        /// Actualiza un libro existente
        /// </summary>
        public async Task<Book> UpdateAsync(Book book)
        {
            _context.Books.Update(book);
            await _context.SaveChangesAsync();
            return book;
        }

        /// <summary>
        /// Elimina un libro por su ID
        /// </summary>
        public async Task<bool> DeleteAsync(int id)
        {
            var book = await _context.Books.FindAsync(id);
            if (book == null)
                return false;

            _context.Books.Remove(book);
            await _context.SaveChangesAsync();
            return true;
        }

        /// <summary>
        /// Verifica si un libro pertenece a un usuario específico
        /// </summary>
        public async Task<bool> BelongsToUserAsync(int bookId, int userId)
        {
            return await _context.Books
                .AnyAsync(b => b.Id == bookId && b.UserId == userId);
        }

        /// <summary>
        /// Busca libros por título o autor
        /// </summary>
        public async Task<IEnumerable<Book>> SearchAsync(string searchTerm, int? userId = null)
        {
            var query = _context.Books.AsQueryable();

            if (userId.HasValue)
            {
                query = query.Where(b => b.UserId == userId.Value);
            }

            if (!string.IsNullOrWhiteSpace(searchTerm))
            {
                var searchLower = searchTerm.ToLower();
                query = query.Where(b => 
                    b.Title.ToLower().Contains(searchLower) || 
                    b.Author.ToLower().Contains(searchLower));
            }

            return await query
                .Include(b => b.User)
                .OrderByDescending(b => b.Id)
                .ToListAsync();
        }
    }
}
