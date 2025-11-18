namespace DigitalLibrary.API.Models.Configuration
{
    /// <summary>
    /// Configuración fuertemente tipada para la integración con MongoDB.
    /// Permite centralizar los parámetros que se necesitarán al construir
    /// el cliente utilizado por la capa GraphQL.
    /// </summary>
    public class MongoSettings
    {
        /// <summary>
        /// Cadena de conexión al clúster MongoDB.
        /// </summary>
        public string ConnectionString { get; set; } = string.Empty;

        /// <summary>
        /// Nombre de la base de datos que se utilizará para almacenar los documentos.
        /// </summary>
        public string DatabaseName { get; set; } = string.Empty;

        /// <summary>
        /// Nombre de la colección donde persistiremos los libros usados por GraphQL.
        /// </summary>
        public string BooksCollectionName { get; set; } = "Books";
    }
}

