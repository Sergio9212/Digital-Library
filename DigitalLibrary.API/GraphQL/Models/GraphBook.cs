using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace DigitalLibrary.API.GraphQL.Models
{
    /// <summary>
    /// Documento que representa un libro dentro del contexto GraphQL/MongoDB.
    /// </summary>
    public class GraphBook
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; } = string.Empty;

        [BsonElement("title")]
        public string Title { get; set; } = string.Empty;

        [BsonElement("author")]
        public string Author { get; set; } = string.Empty;

        [BsonElement("year")]
        public int Year { get; set; }

        [BsonElement("coverImageUrl")]
        public string? CoverImageUrl { get; set; }

        [BsonElement("rating")]
        public int Rating { get; set; }

        [BsonElement("review")]
        public string? Review { get; set; }

        [BsonElement("userId")]
        public int UserId { get; set; }
    }
}

