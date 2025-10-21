using DigitalLibrary.API.Data;
using DigitalLibrary.API.Models;
using Microsoft.EntityFrameworkCore;

namespace DigitalLibrary.API.Repositories
{
    /// <summary>
    /// Implementación del repositorio de usuarios
    /// </summary>
    public class UserRepository : IUserRepository
    {
        private readonly DigitalLibraryContext _context;

        public UserRepository(DigitalLibraryContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Obtiene un usuario por su ID
        /// </summary>
        public async Task<User?> GetByIdAsync(int id)
        {
            return await _context.Users
                .Include(u => u.Books)
                .FirstOrDefaultAsync(u => u.Id == id);
        }

        /// <summary>
        /// Obtiene un usuario por su email
        /// </summary>
        public async Task<User?> GetByEmailAsync(string email)
        {
            return await _context.Users
                .Include(u => u.Books)
                .FirstOrDefaultAsync(u => u.Email == email);
        }

        /// <summary>
        /// Verifica si existe un usuario con el email especificado
        /// </summary>
        public async Task<bool> ExistsByEmailAsync(string email)
        {
            return await _context.Users
                .AnyAsync(u => u.Email == email);
        }

        /// <summary>
        /// Crea un nuevo usuario
        /// </summary>
        public async Task<User> CreateAsync(User user)
        {
            _context.Users.Add(user);
            await _context.SaveChangesAsync();
            return user;
        }

        /// <summary>
        /// Actualiza un usuario existente
        /// </summary>
        public async Task<User> UpdateAsync(User user)
        {
            _context.Users.Update(user);
            await _context.SaveChangesAsync();
            return user;
        }

        /// <summary>
        /// Elimina un usuario por su ID
        /// </summary>
        public async Task<bool> DeleteAsync(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
                return false;

            _context.Users.Remove(user);
            await _context.SaveChangesAsync();
            return true;
        }

        /// <summary>
        /// Obtiene todos los usuarios (para administración)
        /// </summary>
        public async Task<IEnumerable<User>> GetAllAsync()
        {
            return await _context.Users
                .Include(u => u.Books)
                .ToListAsync();
        }
    }
}
