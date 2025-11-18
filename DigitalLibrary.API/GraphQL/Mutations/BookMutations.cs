using DigitalLibrary.API.GraphQL.Inputs;
using DigitalLibrary.API.GraphQL.Models;
using DigitalLibrary.API.GraphQL.Services;
using HotChocolate;
using System.Security.Claims;

namespace DigitalLibrary.API.GraphQL.Mutations
{
    /// <summary>
    /// Mutaciones protegidas para crear, actualizar y eliminar libros mediante GraphQL.
    /// </summary>
    public class BookMutations
    {
        [GraphQLName("createBook")]
        [GraphQLDescription("Crea un nuevo libro persistido en MongoDB.")]
        public async Task<GraphBook> CreateBookAsync(
            CreateBookInput input,
            [Service] IMongoBookService bookService,
            ClaimsPrincipal claimsPrincipal,
            CancellationToken cancellationToken)
        {
            var userId = ResolveUserId(claimsPrincipal);
            var newBook = new GraphBook
            {
                Title = input.Title,
                Author = input.Author,
                Year = input.Year,
                Rating = input.Rating,
                Review = input.Review,
                CoverImageUrl = input.CoverImageUrl,
                UserId = userId
            };

            return await bookService.CreateBookAsync(newBook, cancellationToken);
        }

        [GraphQLName("updateBook")]
        [GraphQLDescription("Actualiza los campos suministrados de un libro existente.")]
        public async Task<GraphBook?> UpdateBookAsync(
            string id,
            UpdateBookInput input,
            [Service] IMongoBookService bookService,
            ClaimsPrincipal claimsPrincipal,
            CancellationToken cancellationToken)
        {
            var userId = ResolveUserId(claimsPrincipal);
            var existing = await bookService.GetBookAsync(id, userId, cancellationToken);

            if (existing == null)
            {
                throw new GraphQLException(ErrorBuilder.New()
                    .SetMessage("Libro no encontrado o no pertenece al usuario.")
                    .SetCode("BOOK_404")
                    .Build());
            }

            existing.Title = input.Title ?? existing.Title;
            existing.Author = input.Author ?? existing.Author;
            existing.Year = input.Year ?? existing.Year;
            existing.Rating = input.Rating ?? existing.Rating;
            existing.Review = input.Review ?? existing.Review;
            existing.CoverImageUrl = input.CoverImageUrl ?? existing.CoverImageUrl;

            return await bookService.UpdateBookAsync(id, userId, existing, cancellationToken);
        }

        [GraphQLName("deleteBook")]
        [GraphQLDescription("Elimina un libro perteneciente al usuario autenticado.")]
        public async Task<bool> DeleteBookAsync(
            string id,
            [Service] IMongoBookService bookService,
            ClaimsPrincipal claimsPrincipal,
            CancellationToken cancellationToken)
        {
            var userId = ResolveUserId(claimsPrincipal);
            return await bookService.DeleteBookAsync(id, userId, cancellationToken);
        }

        private static int ResolveUserId(ClaimsPrincipal claimsPrincipal)
        {
            var claim = claimsPrincipal.FindFirst("userId")?.Value;
            return int.TryParse(claim, out var userId)
                ? userId
                : throw new GraphQLException(ErrorBuilder.New()
                    .SetMessage("No se pudo resolver el ID del usuario autenticado.")
                    .SetCode("AUTH_001")
                    .Build());
        }
    }
}

