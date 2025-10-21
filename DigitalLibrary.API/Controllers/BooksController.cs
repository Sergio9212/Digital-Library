using DigitalLibrary.API.Models.DTOs;
using DigitalLibrary.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace DigitalLibrary.API.Controllers
{
    /// <summary>
    /// 📚 Controlador de Libros
    /// 
    /// Maneja todas las operaciones CRUD relacionadas con los libros de la biblioteca digital.
    /// Requiere autenticación JWT para acceder a todos los endpoints.
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    [Produces("application/json")]
    public class BooksController : ControllerBase
    {
        private readonly IBookService _bookService;
        private readonly ILogger<BooksController> _logger;

        public BooksController(IBookService bookService, ILogger<BooksController> logger)
        {
            _bookService = bookService;
            _logger = logger;
        }

        /// <summary>
        /// 📚 Obtener Todos los Libros del Usuario
        /// </summary>
        /// <remarks>
        /// Recupera una lista completa de todos los libros asociados al usuario autenticado.
        /// 
        /// **Funcionalidad:**
        /// - Obtiene todos los libros del usuario actual
        /// - Incluye información completa: título, autor, año, calificación, reseña
        /// - Muestra ID único de cada libro para operaciones individuales
        /// - Ordenados por ID descendente (más recientes primero)
        /// 
        /// **Información incluida:**
        /// - ID único del libro
        /// - Título y autor
        /// - Año de publicación
        /// - Calificación (1-5 estrellas)
        /// - Reseña del usuario
        /// - URL de imagen de portada (si existe)
        /// 
        /// **Autenticación requerida:** Sí (JWT Token)
        /// 
        /// **Ejemplo de respuesta:**
        /// ```json
        /// [
        ///   {
        ///     "id": 1,
        ///     "title": "Cien años de soledad",
        ///     "author": "Gabriel García Márquez",
        ///     "year": 1967,
        ///     "rating": 5,
        ///     "review": "Una obra maestra de la literatura latinoamericana",
        ///     "coverImageUrl": "https://example.com/cover.jpg",
        ///     "userId": 1
        ///   }
        /// ]
        /// ```
        /// </remarks>
        /// <returns>Lista de libros del usuario</returns>
        /// <response code="200">Retorna la lista de libros exitosamente</response>
        /// <response code="401">Token JWT inválido o expirado</response>
        /// <response code="500">Error interno del servidor</response>
        [HttpGet]
        [ProducesResponseType(typeof(IEnumerable<BookDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> GetBooks()
        {
            try
            {
                var userId = GetCurrentUserId();
                if (userId == 0) return Unauthorized(new { message = "Usuario no autenticado o ID inválido." });

                var books = await _bookService.GetUserBooksAsync(userId);
                return Ok(books);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener libros del usuario {UserId}", GetCurrentUserId());
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// 📖 Obtener Libro por ID
        /// </summary>
        /// <remarks>
        /// Recupera un libro específico por su ID único. Solo devuelve libros que pertenecen al usuario autenticado.
        /// 
        /// **Ejemplo de uso:**
        /// - ID: 1 → Devuelve el libro con ID 1 si pertenece al usuario
        /// - ID: 999 → Devuelve 404 si no existe o no pertenece al usuario
        /// </remarks>
        /// <param name="id">ID único del libro a buscar</param>
        /// <returns>Datos del libro encontrado</returns>
        /// <response code="200">Libro encontrado exitosamente</response>
        /// <response code="401">No autorizado</response>
        /// <response code="404">Libro no encontrado o no pertenece al usuario</response>
        /// <response code="500">Error interno del servidor</response>
        [HttpGet("{id}")]
        [ProducesResponseType(typeof(BookDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> GetBook(int id)
        {
            try
            {
                var userId = GetCurrentUserId();
                if (userId == 0) return Unauthorized(new { message = "Usuario no autenticado o ID inválido." });

                var book = await _bookService.GetBookByIdAsync(id, userId);
                
                if (book == null)
                {
                    return NotFound(new { message = "Libro no encontrado o no pertenece a este usuario." });
                }

                return Ok(book);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener libro {BookId} del usuario {UserId}", id, GetCurrentUserId());
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// ➕ Agregar Nuevo Libro
        /// </summary>
        /// <remarks>
        /// Crea un nuevo libro en la biblioteca personal del usuario autenticado.
        /// 
        /// **Funcionalidad:**
        /// - Agrega un nuevo libro a la colección personal del usuario
        /// - Asigna automáticamente el ID del usuario al libro
        /// - Genera un ID único para el libro
        /// - Valida todos los datos de entrada
        /// 
        /// **Campos requeridos:**
        /// - `title`: Título del libro (máximo 200 caracteres)
        /// - `author`: Autor del libro (máximo 200 caracteres)
        /// - `year`: Año de publicación (entre 1000 y 3000)
        /// - `rating`: Calificación de 1 a 5 estrellas
        /// 
        /// **Campos opcionales:**
        /// - `review`: Reseña personal del libro (máximo 2000 caracteres)
        /// - `coverImageUrl`: URL de la imagen de portada (máximo 500 caracteres)
        /// 
        /// **Validaciones:**
        /// - Título y autor son obligatorios
        /// - Año debe estar entre 1000 y 3000
        /// - Calificación debe estar entre 1 y 5
        /// - Usuario debe estar autenticado
        /// 
        /// **Ejemplo de solicitud:**
        /// ```json
        /// {
        ///   "title": "Cien años de soledad",
        ///   "author": "Gabriel García Márquez",
        ///   "year": 1967,
        ///   "rating": 5,
        ///   "review": "Una obra maestra de la literatura latinoamericana",
        ///   "coverImageUrl": "https://example.com/cover.jpg"
        /// }
        /// ```
        /// 
        /// **Ejemplo de respuesta exitosa:**
        /// ```json
        /// {
        ///   "id": 1,
        ///   "title": "Cien años de soledad",
        ///   "author": "Gabriel García Márquez",
        ///   "year": 1967,
        ///   "rating": 5,
        ///   "review": "Una obra maestra de la literatura latinoamericana",
        ///   "coverImageUrl": "https://example.com/cover.jpg",
        ///   "userId": 1
        /// }
        /// ```
        /// </remarks>
        /// <param name="request">Datos del nuevo libro</param>
        /// <returns>Datos del libro creado con su ID único</returns>
        /// <response code="201">Libro creado exitosamente</response>
        /// <response code="400">Datos de entrada inválidos</response>
        /// <response code="401">No autorizado</response>
        /// <response code="500">Error interno del servidor</response>
        /// <param name="request">Datos del libro a crear</param>
        /// <returns>Libro creado</returns>
        [HttpPost]
        [ProducesResponseType(typeof(BookDto), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> CreateBook([FromBody] CreateBookRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var userId = GetCurrentUserId();
                var book = await _bookService.CreateBookAsync(request, userId);
                
                if (book == null)
                {
                    return BadRequest(new { message = "No se pudo crear el libro" });
                }
                
                return CreatedAtAction(nameof(GetBook), new { id = book!.Id }, book);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al crear libro para el usuario {UserId}", GetCurrentUserId());
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// ✏️ Actualizar Libro Existente
        /// </summary>
        /// <remarks>
        /// Modifica los datos de un libro existente en la biblioteca personal del usuario.
        /// 
        /// **Funcionalidad:**
        /// - Actualiza solo los campos proporcionados (actualización parcial)
        /// - Mantiene los valores existentes para campos no enviados
        /// - Verifica que el libro pertenezca al usuario autenticado
        /// - Valida los nuevos datos antes de guardar
        /// 
        /// **Campos actualizables:**
        /// - `title`: Título del libro (opcional)
        /// - `author`: Autor del libro (opcional)
        /// - `year`: Año de publicación (opcional)
        /// - `rating`: Calificación de 1 a 5 estrellas (opcional)
        /// - `review`: Reseña personal del libro (opcional)
        /// - `coverImageUrl`: URL de la imagen de portada (opcional)
        /// 
        /// **Validaciones:**
        /// - El libro debe existir y pertenecer al usuario
        /// - Los campos enviados deben ser válidos
        /// - Año debe estar entre 1000 y 3000 (si se envía)
        /// - Calificación debe estar entre 1 y 5 (si se envía)
        /// 
        /// **Ejemplo de solicitud:**
        /// ```json
        /// {
        ///   "title": "Cien años de soledad - Edición Especial",
        ///   "rating": 5,
        ///   "review": "Actualizada mi reseña: Una obra maestra absoluta"
        /// }
        /// ```
        /// 
        /// **Ejemplo de respuesta exitosa:**
        /// ```json
        /// {
        ///   "id": 1,
        ///   "title": "Cien años de soledad - Edición Especial",
        ///   "author": "Gabriel García Márquez",
        ///   "year": 1967,
        ///   "rating": 5,
        ///   "review": "Actualizada mi reseña: Una obra maestra absoluta",
        ///   "coverImageUrl": "https://example.com/cover.jpg",
        ///   "userId": 1
        /// }
        /// ```
        /// </remarks>
        /// <param name="id">ID único del libro a actualizar</param>
        /// <param name="request">Datos actualizados del libro (campos opcionales)</param>
        /// <returns>Datos del libro actualizado</returns>
        /// <response code="200">Libro actualizado exitosamente</response>
        /// <response code="400">Datos de entrada inválidos</response>
        /// <response code="401">No autorizado</response>
        /// <response code="404">Libro no encontrado o no pertenece al usuario</response>
        /// <response code="500">Error interno del servidor</response>
        [HttpPut("{id}")]
        [ProducesResponseType(typeof(BookDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> UpdateBook(int id, [FromBody] UpdateBookRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var userId = GetCurrentUserId();
                var book = await _bookService.UpdateBookAsync(id, request, userId);
                
                if (book == null)
                {
                    return NotFound(new { message = "Libro no encontrado" });
                }

                return Ok(book);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al actualizar libro {BookId} del usuario {UserId}", id, GetCurrentUserId());
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// 🗑️ Eliminar Libro
        /// </summary>
        /// <remarks>
        /// Elimina permanentemente un libro de la biblioteca personal del usuario.
        /// 
        /// **Funcionalidad:**
        /// - Elimina el libro de la base de datos
        /// - Verifica que el libro pertenezca al usuario autenticado
        /// - Operación irreversible (no se puede deshacer)
        /// - Libera el ID del libro para futuros usos
        /// 
        /// **Validaciones:**
        /// - El libro debe existir en la base de datos
        /// - El libro debe pertenecer al usuario autenticado
        /// - Usuario debe estar autenticado con JWT válido
        /// 
        /// **Consideraciones:**
        /// - Esta operación es permanente
        /// - No se puede recuperar el libro eliminado
        /// - Se recomienda confirmar antes de eliminar
        /// 
        /// **Ejemplo de respuesta exitosa:**
        /// ```json
        /// {
        ///   "success": true,
        ///   "message": "Libro eliminado exitosamente"
        /// }
        /// ```
        /// 
        /// **Ejemplo de respuesta de error:**
        /// ```json
        /// {
        ///   "success": false,
        ///   "message": "Libro no encontrado o no pertenece a este usuario"
        /// }
        /// ```
        /// </remarks>
        /// <param name="id">ID único del libro a eliminar</param>
        /// <returns>Resultado de la operación de eliminación</returns>
        /// <response code="200">Libro eliminado exitosamente</response>
        /// <response code="401">No autorizado</response>
        /// <response code="404">Libro no encontrado o no pertenece al usuario</response>
        /// <response code="500">Error interno del servidor</response>
        [HttpDelete("{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> DeleteBook(int id)
        {
            try
            {
                var userId = GetCurrentUserId();
                var success = await _bookService.DeleteBookAsync(id, userId);
                
                if (!success)
                {
                    return NotFound(new { message = "Libro no encontrado" });
                }

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al eliminar libro {BookId} del usuario {UserId}", id, GetCurrentUserId());
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