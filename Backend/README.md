# SocialFlow Backend

A modern social media backend API built with .NET 10.0, featuring real-time notifications, messaging, and clean architecture principles.

## Tech Stack

- **.NET 10.0** - Core framework
- **PostgreSQL** - Primary database
- **Redis** - Caching and session management
- **Entity Framework Core** - ORM
- **SignalR** - Real-time communication
- **Hangfire** - Background job processing
- **Serilog** - Structured logging
- **MediatR** - CQRS pattern implementation
- **JWT** - Authentication

## Prerequisites

- [.NET 10.0 SDK](https://dotnet.microsoft.com/download/dotnet/10.0)
- [Docker & Docker Compose](https://www.docker.com/get-started) (for infrastructure services)
- PostgreSQL (if not using Docker)
- Redis (if not using Docker)
- PowerShell (Windows) or bash (Linux/Mac)

## Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd SocialFlow/Backend
```

### 2. Setup Infrastructure

#### Option A: Using Docker Compose (Recommended)

```bash
docker-compose -f docker-compose.infra.yml up -d
```

This will start:
- PostgreSQL on port 5432
- Redis on port 6379

#### Option B: Manual Setup

If you prefer to run PostgreSQL and Redis locally:
- Install PostgreSQL and create a database named `SocialFlow`
- Install Redis and ensure it's running on port 6379

### 3. Configure Connection Strings

Update the connection strings in `src/Api/appsettings.Development.json`:

```json
"ConnectionStrings": {
  "DefaultConnection": "Host=localhost;Port=5432;Database=SocialFlow;Username=postgres;Password=your_password",
  "Redis": "localhost:6379,password=your_redis_password,abortConnect=false"
}
```

### 4. Database Migrations

#### Using PowerShell Script (Windows)

The project includes a convenient PowerShell script at `src/ef.ps1` for managing migrations:

```powershell
# Navigate to src directory
cd src

# Add a new migration
.\ef.ps1 -add MigrationName

# Update database to latest migration
.\ef.ps1 -up

# Remove the last migration
.\ef.ps1 -remove

# Display help
.\ef.ps1
```

#### Using dotnet ef Directly (Cross-Platform)

```bash
# Add a new migration
dotnet ef migrations add MigrationName \
  --project src/Infrastructure/Infrastructure.csproj \
  --startup-project src/Api/Api.csproj \
  --output-dir Persistence/Migrations

# Update database to latest migration
dotnet ef database update \
  --project src/Infrastructure/Infrastructure.csproj \
  --startup-project src/Api/Api.csproj

# Remove the last migration
dotnet ef migrations remove \
  --project src/Infrastructure/Infrastructure.csproj \
  --startup-project src/Api/Api.csproj

# List all migrations
dotnet ef migrations list \
  --project src/Infrastructure/Infrastructure.csproj \
  --startup-project src/Api/Api.csproj
```

### 5. Run the Application

```bash
dotnet run --project src/Api/Api.csproj
```

The API will start on `http://localhost:5000` (or as configured in `launchSettings.json`).

## Access Points

### API Endpoints
- **Base URL**: `http://localhost:5000`
- **Swagger UI**: `http://localhost:5000/swagger` or `http://localhost:5000/swagger/index.html`
- **OpenAPI Spec**: `http://localhost:5000/openapi/v1.json`

### Background Jobs
- **Hangfire Dashboard**: `http://localhost:5000/hangfire`

### Real-time Communication
- **SignalR Hub**: `http://localhost:5000/hubs/notifications`

## Configuration

The application uses the `appsettings.json` and environment-specific configuration files:

### Key Configuration Sections

**Connection Strings** (`appsettings.Development.json`):
```json
"ConnectionStrings": {
  "DefaultConnection": "Host=localhost;Port=5432;Database=SocialFlow;Username=postgres;Password=your_password",
  "Redis": "localhost:6379,password=your_password,abortConnect=false"
}
```

**JWT Settings**:
```json
"JwtSettings": {
  "SecretKey": "your-secret-key-minimum-32-characters",
  "Issuer": "SocialFlow_API",
  "Audience": "SocialFlow_Frontend",
  "ExpiryInMinutes": 15
}
```

**Email Settings** (for notifications):
```json
"EmailSettings": {
  "Host": "smtp.gmail.com",
  "Port": 587,
  "Username": "your-email@gmail.com",
  "Password": "your-app-specific-password",
  "From": "your-email@gmail.com"
}
```

**Allowed Origins** (CORS):
```json
"AllowedOrigins": ["http://localhost:5173", "https://your-domain.com"]
}
```

## Project Structure

The project follows Clean Architecture principles:

```
src/
├── Api/                    # Presentation layer (Web API)
│   ├── Controllers/        # API controllers
│   ├── Middlewares/        # Custom middleware
│   └── Extensions/         # Service extensions
├── Application/           # Application layer
│   ├── Features/           # Feature modules (CQRS)
│   ├── Common/             # Shared application logic
│   └── DependencyInjection.cs
├── Domain/                 # Domain layer
│   ├── Entities/           # Domain entities
│   ├── Enums/              # Enumerations
│   ├── Events/             # Domain events
│   └── Errors/             # Domain errors
└── Infrastructure/         # Infrastructure layer
    ├── Persistence/        # Database context & migrations
    ├── Services/           # External services
    ├── Authentication/    # Identity & JWT
    └── BackgroundJobs/     # Hangfire jobs
```

## Development Workflow

### Creating a New Feature

1. **Create Domain Entity** (in `src/Domain/Entities/`)
2. **Create Repository** (in `src/Infrastructure/Persistence/Repository/`)
3. **Create CQRS Handlers** (in `src/Application/Features/`)
4. **Create Controller** (in `src/Api/Controller/`)
5. **Add Migration** (if schema changed)
6. **Test** using Swagger UI or integration tests

### Adding a New Migration

When you modify entities or need to update the database schema:

```bash
# Using PowerShell
cd src
.\ef.ps1 -add DescriptiveMigrationName

# Or using dotnet ef
dotnet ef migrations add DescriptiveMigrationName \
  --project src/Infrastructure/Infrastructure.csproj \
  --startup-project src/Api/Api.csproj \
  --output-dir Persistence/Migrations
```

Then update the database:
```bash
# Using PowerShell
.\ef.ps1 -up

# Or using dotnet ef
dotnet ef database update \
  --project src/Infrastructure/Infrastructure.csproj \
  --startup-project src/Api/Api.csproj
```

## Testing

### Run Unit Tests
```bash
dotnet test tests/SocialFlow.UnitTests/SocialFlow.UnitTests.csproj
```

### Run Integration Tests
```bash
dotnet test tests/SocialFlow.IntegrationTests/SocialFlow.IntegrationTests.csproj
```

## Troubleshooting

### Database Connection Issues
- Ensure PostgreSQL is running: `docker ps` or check locally installed service
- Verify connection string in `appsettings.Development.json`
- Check if the database exists: Connect to PostgreSQL and run `\l` to list databases

### Migration Issues
- If migrations fail, try removing the last migration and recreating it
- Ensure you're in the correct directory when running EF commands
- Check that Entity Framework Core tools are installed: `dotnet ef --version`

### Redis Connection Issues
- Ensure Redis is running: `docker ps` or `redis-cli ping`
- Verify Redis connection string in configuration
- Check firewall settings if Redis is on a different machine

### Build Issues
- Restore NuGet packages: `dotnet restore`
- Clean and rebuild: `dotnet clean && dotnet build`
- Ensure you're using .NET 10.0 SDK: `dotnet --version`

## Additional Resources

- [Entity Framework Core Documentation](https://docs.microsoft.com/en-us/ef/core/)
- [ASP.NET Core Documentation](https://docs.microsoft.com/en-us/aspnet/core/)
- [SignalR Documentation](https://docs.microsoft.com/en-us/aspnet/core/signalr/)
- [Hangfire Documentation](https://docs.hangfire.io/)

## License

[Add your license information here]