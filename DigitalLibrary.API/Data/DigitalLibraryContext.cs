using DigitalLibrary.API.Models;
using Microsoft.EntityFrameworkCore;

namespace DigitalLibrary.API.Data
{
    public class DigitalLibraryContext : DbContext
    {
        public DigitalLibraryContext(DbContextOptions<DigitalLibraryContext> options) : base(options)
        {
        }

        public DbSet<User> Users { get; set; }
        public DbSet<Book> Books { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configure User entity
            modelBuilder.Entity<User>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Email).IsRequired().HasMaxLength(255);
                entity.HasIndex(e => e.Email).IsUnique();
                entity.Property(e => e.Nombre).IsRequired().HasMaxLength(100);
                entity.Property(e => e.Apellido).IsRequired().HasMaxLength(100);
                entity.Property(e => e.PasswordHash).IsRequired();
            });

            // Configure Book entity
            modelBuilder.Entity<Book>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Title).IsRequired().HasMaxLength(200);
                entity.Property(e => e.Author).IsRequired().HasMaxLength(200);
                entity.Property(e => e.Year).IsRequired();
                entity.Property(e => e.CoverImageUrl).HasMaxLength(500);
                entity.Property(e => e.Review).HasMaxLength(2000);
                entity.Property(e => e.Rating).IsRequired();

                // Configure foreign key relationship
                entity.HasOne(e => e.User)
                    .WithMany(u => u.Books)
                    .HasForeignKey(e => e.UserId)
                    .OnDelete(DeleteBehavior.Cascade);
            });
        }
    }
}
