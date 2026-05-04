# SocialFlow

A high-performance social networking platform built with modern technologies, Clean Architecture, and real-time capabilities.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![.NET](https://img.shields.io/badge/.NET-10.0-purple.svg)
![React](https://img.shields.io/badge/React-19-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)

## 🚀 Features

- **Authentication** - JWT-based authentication with secure token management
- **Posts & Media** - Create, edit, delete posts with image/video uploads
- **Comments** - 3-level nested comment system with real-time updates
- **Reactions** - Like and react to posts and comments
- **Friendships** - Send requests, accept/decline, manage connections
- **Real-time Notifications** - SignalR-powered instant notifications
- **Media Management** - Cloudinary integration for fast media uploads
- **Background Processing** - Reliable event handling with Outbox Pattern

## 🏗️ Architecture

### Backend (.NET 10.0)

```
Backend/
├── src/
│   ├── Api/           # Controllers, Middleware, Swagger
│   ├── Application/   # CQRS Commands/Queries, Handlers, DTOs
│   ├── Domain/        # Entities, Value Objects, Domain Events
│   └── Infrastructure/# Database, External Services, Background Jobs
└── tests/             # Unit & Integration Tests
```

**Key Patterns:**
- **Clean Architecture** - Layered separation of concerns
- **CQRS** - Command Query Responsibility Segregation with MediatR
- **Repository Pattern** - Abstract data access
- **Outbox Pattern** - Reliable event processing (custom implementation)

**Technologies:**
- ASP.NET Core 10.0 Web API
- PostgreSQL (Primary Database)
- Redis (Caching)
- Entity Framework Core (ORM)
- Hangfire (Background Jobs)
- SignalR (Real-time)
- Cloudinary (Media Storage)
- Serilog (Logging)

### Frontend (React 19)

```
Frontend/
├── src/
│   ├── components/    # Reusable UI components
│   ├── features/     # Feature-based modules (auth, social, etc.)
│   ├── hooks/        # Custom React hooks
│   ├── services/      # API service layers
│   ├── stores/       # Redux state management
│   └── pages/        # Page components
├── public/           # Static assets
└── package.json
```

**Technologies:**
- React 19.2.0
- Vite (Bundler)
- TypeScript 5.9
- TailwindCSS 4.1
- TanStack Query (Server State)
- Redux Toolkit (Client State)
- React Router 7
- React Hook Form + Zod (Forms)

## 📋 Prerequisites

- **.NET 10.0 SDK** - [Download](https://dotnet.microsoft.com/download/dotnet/10.0)
- **Node.js 20+** - [Download](https://nodejs.org/)
- **pnpm** - `npm install -g pnpm`
- **Docker** - [Download](https://docker.com/) (for PostgreSQL & Redis)
- **PostgreSQL 15+** - [Download](https://postgresql.org/)
- **Redis 7+** - [Download](https://redis.io/)

## 🛠️ Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/manaxpow/Social-Flow.git
cd Social-Flow
```

### 2. Setup Infrastructure

Start PostgreSQL and Redis using Docker:

```bash
cd Backend
docker-compose -f docker-compose.infra.yml up -d
```

### 3. Setup Backend

```bash
cd Backend/src

# Restore dependencies
dotnet restore

# Run database migrations
dotnet ef database update \
  --project Infrastructure/Infrastructure.csproj \
  --startup-project Api/Api.csproj

# Run the API
dotnet run --project Api/Api.csproj
```

The API will be available at `http://localhost:5000`

### 4. Setup Frontend

```bash
cd Frontend

# Install dependencies
pnpm install

# Run development server
pnpm dev
```

The frontend will be available at `http://localhost:5173`

### 5. Environment Configuration

**Backend** (`Backend/src/Api/appsettings.json`):
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Database=socialflow;Username=postgres;Password=yourpassword"
  },
  "JwtSettings": {
    "SecretKey": "your-secret-key-minimum-32-characters",
    "Issuer": "SocialFlow_API",
    "Audience": "SocialFlow_Frontend",
    "ExpiryInMinutes": 15
  }
}
```

**Frontend** - Create `.env` file:
```
VITE_API_URL=http://localhost:5000
VITE_CLOUDINARY_CLOUD_NAME=your-cloud-name
```

## 📁 Project Structure

### Backend Layers

| Layer | Description |
|-------|-------------|
| **Domain** | Business entities, value objects, domain events (no external dependencies) |
| **Application** | CQRS commands/queries, handlers, DTOs, validation |
| **Infrastructure** | Database access, external services, background jobs |
| **Api** | Controllers, middleware, dependency injection |

### Frontend Structure

| Directory | Purpose |
|-----------|---------|
| `components/common/` | Reusable UI components (Button, Dialog, etc.) |
| `components/features/` | Feature-specific components (auth, social, etc.) |
| `hooks/` | Custom React hooks for shared logic |
| `services/` | API service layers (axios, REST calls) |
| `stores/` | Redux state management |
| `pages/` | Page-level components |
| `lib/` | Utilities, axios configuration |

## 🔌 API Documentation

Swagger is available when the API is running:

- **Swagger UI**: `http://localhost:5000/swagger`
- **OpenAPI Spec**: `http://localhost:5000/openapi/v1.json`

### Key Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register new user |
| POST | `/auth/login` | User login |
| GET | `/post` | Get feed posts |
| POST | `/post` | Create new post |
| GET | `/comment/post/{postId}/top-level` | Get top-level comments |
| POST | `/comment` | Create comment/reply |
| POST | `/friendship/request` | Send friend request |
| GET | `/media/setup-upload` | Get Cloudinary signature |

## 🔄 CI/CD Pipeline

The project uses GitHub Actions for continuous integration and deployment:

```yaml
# Triggers on push to main, dev, feature/**, bugfix/**
# Runs:
#   1. Backend CI (dotnet restore, build, test)
#   2. Frontend CI (npm install, build)
#   3. Deploy to Render & Vercel (on main branch)
```

**Secrets Required:**
- `RENDER_DEPLOY_HOOK` - Trigger Render deployment
- `VERCEL_DEPLOY_HOOK` - Trigger Vercel deployment

## 🧪 Testing

### Backend Tests

```bash
cd Backend
dotnet test --configuration Release
```

### Frontend Type Checking

```bash
cd Frontend
pnpm exec tsc --noEmit
```

## 📚 Documentation

Detailed documentation is available in the `docs/` folder:

- [Architecture](docs/architecture/architecture.md) - System design and patterns
- [Entity Relationship](docs/architecture/erd.md) - Database schema
- [Outbox Pattern](docs/architecture/outbox-pattern.md) - Event processing
- [Use Cases](docs/usecases/) - Feature specifications

## 🛡️ Security

- JWT token-based authentication
- Password hashing with BCrypt
- CORS policy configuration
- Rate limiting (100 req/min)
- Input validation with Zod/FluentValidation
- SQL injection prevention (EF Core)
- XSS protection (React escaping)

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [ASP.NET Core](https://learn.microsoft.com/aspnet/core)
- [React](https://react.dev/)
- [TanStack Query](https://tanstack.com/query)
- [TailwindCSS](https://tailwindcss.com/)
- [Cloudinary](https://cloudinary.com/)
- [SignalR](https://learn.microsoft.com/aspnet/signalr)