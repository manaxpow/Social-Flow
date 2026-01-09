using Application;
using Infrastructure;

var builder = WebApplication.CreateBuilder(args);

var configuration = builder.Configuration;

// Add services layer
builder.Services.AddInfrastructureServices(configuration);
builder.Services.AddApplicationServices();

// Add swagger
builder.Services.AddSwaggerDocumentaion();

builder.Services.AddOpenApi();
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}
// Use global exception handling middleware
app.UseMiddleware<CorrelationIdMiddleware>();
app.UseMiddleware<GlobalExceptionMiddleware>();

app.UseHttpsRedirection();
app.MapControllers();
app.Run();
