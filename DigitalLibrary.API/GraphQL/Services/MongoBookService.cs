using DigitalLibrary.API.GraphQL.Models;
using DigitalLibrary.API.Models.Configuration;
using Microsoft.Extensions.Options;
using MongoDB.Driver;

namespace DigitalLibrary.API.GraphQL.Services
{
    /// <summary>
    /// Servicio encargado de interactuar con MongoDB para las operaciones expuestas vía GraphQL.
    /// </summary>
    public interface IMongoBookService
    {
        Task<List<GraphBook>> GetBooksAsync(int userId, CancellationToken cancellationToken);
        Task<GraphBook?> GetBookAsync(string id, int userId, CancellationToken cancellationToken);
        Task<GraphBook> CreateBookAsync(GraphBook book, CancellationToken cancellationToken);
        Task<GraphBook?> UpdateBookAsync(string id, int userId, GraphBook book, CancellationToken cancellationToken);
        Task<bool> DeleteBookAsync(string id, int userId, CancellationToken cancellationToken);
    }

    public class MongoBookService : IMongoBookService
    {
        private readonly IMongoCollection<GraphBook> _booksCollection;

        public MongoBookService(IOptions<MongoSettings> mongoOptions)
        {
            var settings = mongoOptions.Value;
            var client = new MongoClient(settings.ConnectionString);
            var database = client.GetDatabase(settings.DatabaseName);
            _booksCollection = database.GetCollection<GraphBook>(settings.BooksCollectionName);
        }

        public async Task<List<GraphBook>> GetBooksAsync(int userId, CancellationToken cancellationToken)
        {
            return await _booksCollection
                .Find(b => b.UserId == userId)
                .SortByDescending(b => b.Id)
                .ToListAsync(cancellationToken);
        }

        public async Task<GraphBook?> GetBookAsync(string id, int userId, CancellationToken cancellationToken)
        {
            return await _booksCollection
                .Find(b => b.Id == id && b.UserId == userId)
                .FirstOrDefaultAsync(cancellationToken);
        }

        public async Task<GraphBook> CreateBookAsync(GraphBook book, CancellationToken cancellationToken)
        {
            await _booksCollection.InsertOneAsync(book, cancellationToken: cancellationToken);
            return book;
        }

        public async Task<GraphBook?> UpdateBookAsync(string id, int userId, GraphBook updatedBook, CancellationToken cancellationToken)
        {
            var filter = Builders<GraphBook>.Filter.Where(b => b.Id == id && b.UserId == userId);
            var options = new FindOneAndReplaceOptions<GraphBook>
            {
                ReturnDocument = ReturnDocument.After
            };

            var result = await _booksCollection.FindOneAndReplaceAsync(
                filter,
                updatedBook,
                options,
                cancellationToken);

            return result;
        }

        public async Task<bool> DeleteBookAsync(string id, int userId, CancellationToken cancellationToken)
        {
            var result = await _booksCollection.DeleteOneAsync(
                filter: b => b.Id == id && b.UserId == userId,
                cancellationToken: cancellationToken);

            return result.DeletedCount > 0;
        }
    }
}

