using Microsoft.OpenApi.Models;
using DigitalLibrary.API.Data;
using DigitalLibrary.API.Services;
using DigitalLibrary.API.Repositories;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();

// Configure Entity Framework
builder.Services.AddDbContext<DigitalLibraryContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// Configure JWT Authentication
var jwtSettings = builder.Configuration.GetSection("JwtSettings");
var secretKey = jwtSettings["SecretKey"] ?? "YourSuperSecretKeyThatIsAtLeast32CharactersLong!";
var issuer = jwtSettings["Issuer"] ?? "DigitalLibrary";
var audience = jwtSettings["Audience"] ?? "DigitalLibraryUsers";

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = issuer,
            ValidAudience = audience,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey))
        };
    });

builder.Services.AddAuthorization();

// Register repositories
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IBookRepository, BookRepository>();

// Register services
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IBookService, BookService>();

// Configure Swagger/OpenAPI
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo 
    { 
        Title = "📚 Digital Library API", 
        Version = "v1.0.0",
        Description = @"
## 🎯 API para Gestión de Biblioteca Digital

Esta API proporciona funcionalidades completas para la gestión de una biblioteca digital personal.

### 🔐 **Autenticación**
- Registro de nuevos usuarios
- Inicio de sesión con JWT
- Tokens seguros con expiración de 24 horas

### 📖 **Gestión de Libros**
- CRUD completo de libros personales
- Sistema de calificaciones (1-5 estrellas)
- Reseñas escritas por usuarios
- Imágenes de portada opcionales

### 👥 **Gestión de Usuarios**
- Perfiles de usuario
- Cambio de contraseñas
- Eliminación de cuentas

### 🛡️ **Seguridad**
- Autenticación JWT robusta
- Encriptación de contraseñas
- Validación de datos completa
- CORS configurado para React

### 🌐 **Tecnologías**
- .NET 8 Web API
- Entity Framework Core
- SQL Server
- JWT Authentication
        ",
        Contact = new OpenApiContact
        {
            Name = "Digital Library Team",
            Email = "support@digitallibrary.com"
        },
        License = new OpenApiLicense
        {
            Name = "MIT License",
            Url = new Uri("https://opensource.org/licenses/MIT")
        }
    });
    
    // Include XML comments
    var xmlFile = $"{System.Reflection.Assembly.GetExecutingAssembly().GetName().Name}.xml";
    var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
    if (File.Exists(xmlPath))
    {
        c.IncludeXmlComments(xmlPath);
    }
    
    // Add JWT authentication to Swagger
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = @"
**JWT Authorization Header**

Para autenticarse, incluya el token JWT en el header Authorization:

```
Authorization: Bearer {tu_token_aqui}
```

**Obtener token:**
1. Use `/api/auth/register` para crear una cuenta
2. Use `/api/auth/login` para obtener el token
3. Copie el token de la respuesta
4. Haga clic en 'Authorize' y pegue el token
        ",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT"
    });
    
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            new string[] {}
        }
    });
    
    // Customize operation IDs
    c.CustomOperationIds(apiDesc =>
    {
        return apiDesc.ActionDescriptor.DisplayName;
    });
});

// Configure CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp", policy =>
    {
        policy.WithOrigins("http://localhost:3000")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline.
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "📚 Digital Library API v1.0.0");
    c.RoutePrefix = "swagger";
    c.DocumentTitle = "Digital Library API Documentation";
    c.DefaultModelsExpandDepth(-1); // Hide models section by default
    c.DefaultModelRendering(Swashbuckle.AspNetCore.SwaggerUI.ModelRendering.Model);
    c.DocExpansion(Swashbuckle.AspNetCore.SwaggerUI.DocExpansion.List);
    c.EnableDeepLinking();
    c.EnableFilter();
    c.ShowExtensions();
    c.EnableValidator();
    c.SupportedSubmitMethods(Swashbuckle.AspNetCore.SwaggerUI.SubmitMethod.Get, 
                            Swashbuckle.AspNetCore.SwaggerUI.SubmitMethod.Post, 
                            Swashbuckle.AspNetCore.SwaggerUI.SubmitMethod.Put, 
                            Swashbuckle.AspNetCore.SwaggerUI.SubmitMethod.Delete);
    c.DisplayRequestDuration();
    c.EnableTryItOutByDefault();
});

app.UseCors("AllowReactApp");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// Ensure database is created
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<DigitalLibraryContext>();
    context.Database.EnsureCreated();
}

app.Run();
