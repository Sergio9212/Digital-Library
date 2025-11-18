# Biblioteca Digital

Sistema de gestión de biblioteca digital desarrollado con .NET 8 Web API y React.

## Tecnologías

- Backend: .NET 8, ASP.NET Core Web API, Entity Framework Core, MongoDB Driver, HotChocolate (GraphQL)
- Frontend: React, TypeScript, Vite, Axios
- Bases de datos: SQL Server (REST), MongoDB (GraphQL)
- Containerización: Docker, Docker Compose

## Instalación

1. Clonar el repositorio
2. Ejecutar: `docker-compose up --build -d`
   - `frontend`: http://localhost:3000
   - `webapi`: http://localhost:5000/swagger
   - `graphql`: http://localhost:5000/graphql-ui (GraphiQL embebido) / http://localhost:5000/graphql (endpoint)
   - `mongo-express`: http://localhost:8081 (credenciales admin/admin)
3. Acceder a: http://localhost:3000

> Consejo: el panel principal sigue usando REST + SQL Server, mientras que el nuevo bloque “Panel GraphQL + MongoDB” del dashboard se comunica con `/graphql` y persiste los datos en MongoDB. Ambos comparten autenticación JWT gracias a Axios y los interceptores configurados en el cliente.

## Funcionalidades

- Registro e inicio de sesión de usuarios
- Gestión de libros (CRUD)
- Sistema de calificaciones y reseñas
- Gestión de perfil de usuario

## Autor

Sergio9212