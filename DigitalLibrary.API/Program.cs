using Microsoft.OpenApi.Models;
using DigitalLibrary.API.Data;
using DigitalLibrary.API.GraphQL.Mutations;
using DigitalLibrary.API.GraphQL.Queries;
using DigitalLibrary.API.GraphQL.Services;
using DigitalLibrary.API.Models.Configuration;
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

// MongoDB + GraphQL configuration
builder.Services.Configure<MongoSettings>(builder.Configuration.GetSection("MongoSettings"));
builder.Services.AddSingleton<IMongoBookService, MongoBookService>();
builder.Services.AddHttpContextAccessor();

builder.Services
    .AddGraphQLServer()
    .AddAuthorization()
    .AddQueryType<BookQueries>()
    .AddMutationType<BookMutations>();

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
    var xmlPath = System.IO.Path.Combine(AppContext.BaseDirectory, xmlFile);
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
app.MapGraphQL("/graphql").RequireAuthorization();

// Panel minimalista para probar GraphQL sin dependencias externas
app.MapGet("/graphql-ui", async context =>
{
    const string html = """
<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <title>Digital Library GraphQL Console</title>
    <link rel="icon" href="data:," />
    <style>
      * { box-sizing: border-box; }
      body {
        margin: 0;
        font-family: "Segoe UI", Arial, sans-serif;
        background: #0f172a;
        color: #e2e8f0;
        min-height: 100vh;
        display: flex;
        flex-direction: column;
      }
      header {
        padding: 16px 32px;
        background: #1e293b;
        border-bottom: 1px solid rgba(255,255,255,0.08);
      }
      main {
        padding: 24px 32px;
        flex: 1;
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
        gap: 24px;
      }
      section {
        background: #1e293b;
        border: 1px solid rgba(255,255,255,0.08);
        border-radius: 16px;
        padding: 20px;
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      textarea, input {
        width: 100%;
        background: #0f172a;
        color: #e2e8f0;
        border: 1px solid rgba(255,255,255,0.12);
        border-radius: 10px;
        padding: 10px;
        font-size: 14px;
        font-family: "Fira Code", Consolas, monospace;
      }
      textarea { min-height: 180px; resize: vertical; }
      label { font-size: 13px; font-weight: 600; color: #94a3b8; }
      button {
        background: linear-gradient(135deg, #6366f1, #8b5cf6);
        color: white;
        border: none;
        border-radius: 10px;
        padding: 12px 20px;
        font-size: 15px;
        font-weight: 600;
        cursor: pointer;
        margin-top: 8px;
      }
      pre {
        background: #0f172a;
        border-radius: 12px;
        padding: 16px;
        overflow: auto;
        font-size: 13px;
      }
      .status {
        font-size: 12px;
        color: #38bdf8;
      }
    </style>
  </head>
  <body>
    <header>
      <h1 style="margin:0;font-size:22px;">📚 GraphQL Console</h1>
      <p style="margin:4px 0 0;font-size:14px;color:#94a3b8;">
        Ejecuta consultas/mutaciones contra <code>/graphql</code>. Coloca tu token JWT abajo.
      </p>
    </header>
    <main>
      <section>
        <label for="token">Token JWT (sin "Bearer")</label>
        <input id="token" placeholder="eyJhbGciOiJIUzI1NiIsIn..." />

        <label for="query">Query / Mutation</label>
        <textarea id="query">query MyBooks {
  myBooks {
    id
    title
    author
    rating
  }
}</textarea>

        <label for="variables">Variables (opcional)</label>
        <textarea id="variables" placeholder='{"id": "..." }'></textarea>

        <button id="execute">Ejecutar</button>
        <span class="status" id="status"></span>
      </section>

      <section>
        <label>Respuesta</label>
        <pre id="response">Pulsa "Ejecutar" para ver la salida aquí.</pre>
      </section>
    </main>

    <script>
      const $ = (id) => document.getElementById(id);
      const button = $("execute");
      const status = $("status");

      // Intenta recuperar token guardado por la SPA
      const storedToken = localStorage.getItem("token");
      if (storedToken && !$("token").value) {
        $("token").value = storedToken;
      }

      button.addEventListener("click", async () => {
        status.textContent = "Enviando...";
        const token = $("token").value.trim();
        const query = $("query").value;
        const variablesText = $("variables").value;

        let variables = undefined;
        if (variablesText) {
          try {
            variables = JSON.parse(variablesText);
          } catch (error) {
            $("response").textContent = "❌ Variables inválidas: " + error;
            status.textContent = "";
            return;
          }
        }

        const headers = {
          "Content-Type": "application/json"
        };
        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }

        try {
          const response = await fetch("/graphql", {
            method: "POST",
            headers,
            body: JSON.stringify({ query, variables })
          });
          const data = await response.json();
          $("response").textContent = JSON.stringify(data, null, 2);
          status.textContent = response.ok ? "✅ OK" : "⚠️ Error HTTP " + response.status;
        } catch (error) {
          $("response").textContent = "❌ Error de red: " + error;
          status.textContent = "";
        }
      });
    </script>
  </body>
</html>
""";

    context.Response.ContentType = "text/html";
    await context.Response.WriteAsync(html);
});

// Ensure database is created
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<DigitalLibraryContext>();
    context.Database.EnsureCreated();
}

app.Run();
