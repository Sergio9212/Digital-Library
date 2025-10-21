using DigitalLibrary.API.Models;

namespace DigitalLibrary.API.Repositories
{
    /// <summary>
    /// Interface para operaciones de repositorio de libros
    /// </summary>
    public interface IBookRepository
    {
        /// <summary>
        /// Obtiene un libro por su ID
        /// </summary>
        /// <param name="id">ID del libro</param>
        /// <returns>Libro encontrado o null</returns>
        Task<Book?> GetByIdAsync(int id);

        /// <summary>
        /// Obtiene todos los libros de un usuario específico
        /// </summary>
        /// <param name="userId">ID del usuario</param>
        /// <returns>Lista de libros del usuario</returns>
        Task<IEnumerable<Book>> GetByUserIdAsync(int userId);

        /// <summary>
        /// Obtiene todos los libros (para administración)
        /// </summary>
        /// <returns>Lista de todos los libros</returns>
        Task<IEnumerable<Book>> GetAllAsync();

        /// <summary>
        /// Crea un nuevo libro
        /// </summary>
        /// <param name="book">Libro a crear</param>
        /// <returns>Libro creado</returns>
        Task<Book> CreateAsync(Book book);

        /// <summary>
        /// Actualiza un libro existente
        /// </summary>
        /// <param name="book">Libro con datos actualizados</param>
        /// <returns>Libro actualizado</returns>
        Task<Book> UpdateAsync(Book book);

        /// <summary>
        /// Elimina un libro por su ID
        /// </summary>
        /// <param name="id">ID del libro a eliminar</param>
        /// <returns>True si se eliminó, False si no se encontró</returns>
        Task<bool> DeleteAsync(int id);

        /// <summary>
        /// Verifica si un libro pertenece a un usuario específico
        /// </summary>
        /// <param name="bookId">ID del libro</param>
        /// <param name="userId">ID del usuario</param>
        /// <returns>True si pertenece al usuario, False si no</returns>
        Task<bool> BelongsToUserAsync(int bookId, int userId);

        /// <summary>
        /// Busca libros por título o autor
        /// </summary>
        /// <param name="searchTerm">Término de búsqueda</param>
        /// <param name="userId">ID del usuario (opcional, para filtrar por usuario)</param>
        /// <returns>Lista de libros que coinciden con la búsqueda</returns>
        Task<IEnumerable<Book>> SearchAsync(string searchTerm, int? userId = null);
    }
}
