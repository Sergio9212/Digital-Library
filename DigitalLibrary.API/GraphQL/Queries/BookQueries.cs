using DigitalLibrary.API.GraphQL.Models;
using DigitalLibrary.API.GraphQL.Services;
using HotChocolate;
using System.Security.Claims;

namespace DigitalLibrary.API.GraphQL.Queries
{
    /// <summary>
    /// Consultas disponibles para la API GraphQL enfocada en libros.
    /// </summary>
    public class BookQueries
    {
        [GraphQLName("myBooks")]
        [GraphQLDescription("Obtiene todos los libros del usuario autenticado desde MongoDB.")]
        public async Task<IEnumerable<GraphBook>> GetMyBooksAsync(
            [Service] IMongoBookService bookService,
            ClaimsPrincipal claimsPrincipal,
            CancellationToken cancellationToken)
        {
            var userId = ResolveUserId(claimsPrincipal);
            return await bookService.GetBooksAsync(userId, cancellationToken);
        }

        [GraphQLName("book")]
        [GraphQLDescription("Obtiene un libro específico por su identificador de MongoDB.")]
        public async Task<GraphBook?> GetBookByIdAsync(
            string id,
            [Service] IMongoBookService bookService,
            ClaimsPrincipal claimsPrincipal,
            CancellationToken cancellationToken)
        {
            var userId = ResolveUserId(claimsPrincipal);
            return await bookService.GetBookAsync(id, userId, cancellationToken);
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

