using DigitalLibrary.API.Models;

namespace DigitalLibrary.API.Repositories
{
    /// <summary>
    /// Interface para operaciones de repositorio de usuarios
    /// </summary>
    public interface IUserRepository
    {
        /// <summary>
        /// Obtiene un usuario por su ID
        /// </summary>
        /// <param name="id">ID del usuario</param>
        /// <returns>Usuario encontrado o null</returns>
        Task<User?> GetByIdAsync(int id);

        /// <summary>
        /// Obtiene un usuario por su email
        /// </summary>
        /// <param name="email">Email del usuario</param>
        /// <returns>Usuario encontrado o null</returns>
        Task<User?> GetByEmailAsync(string email);

        /// <summary>
        /// Verifica si existe un usuario con el email especificado
        /// </summary>
        /// <param name="email">Email a verificar</param>
        /// <returns>True si existe, False si no</returns>
        Task<bool> ExistsByEmailAsync(string email);

        /// <summary>
        /// Crea un nuevo usuario
        /// </summary>
        /// <param name="user">Usuario a crear</param>
        /// <returns>Usuario creado</returns>
        Task<User> CreateAsync(User user);

        /// <summary>
        /// Actualiza un usuario existente
        /// </summary>
        /// <param name="user">Usuario con datos actualizados</param>
        /// <returns>Usuario actualizado</returns>
        Task<User> UpdateAsync(User user);

        /// <summary>
        /// Elimina un usuario por su ID
        /// </summary>
        /// <param name="id">ID del usuario a eliminar</param>
        /// <returns>True si se eliminó, False si no se encontró</returns>
        Task<bool> DeleteAsync(int id);

        /// <summary>
        /// Obtiene todos los usuarios (para administración)
        /// </summary>
        /// <returns>Lista de todos los usuarios</returns>
        Task<IEnumerable<User>> GetAllAsync();
    }
}
