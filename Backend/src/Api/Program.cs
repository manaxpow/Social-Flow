using Application;
using Hangfire;
using Infrastructure;
using Serilog;

var builder = WebApplication.CreateBuilder(args);

Log.Logger = new LoggerConfiguration()
    .ReadFrom.Configuration(builder.Configuration)
    .Enrich.FromLogContext()
    .CreateLogger();


builder.Host.UseSerilog();

// Add services layer

try
{
    Log.Information(">>> SocialFlow Backend is starting up...");

    builder.Services.AddInfrastructureServices(builder.Configuration);
    builder.Services.AddApplicationServices();

    // Add swagger

    builder.Services.AddControllers();
    builder.Services.AddEndpointsApiExplorer();
    builder.Services.AddOpenApi();
    builder.Services.AddSwaggerDocumentaion();

    var app = builder.Build();

    if (app.Environment.IsDevelopment())
    {
        app.MapOpenApi();
    }
    // Use global exception handling middleware
    app.UseMiddleware<CorrelationIdMiddleware>();
    app.UseMiddleware<GlobalExceptionMiddleware>();

    // Use Serilog request logging 
    app.UseSerilogRequestLogging();


    app.UseHttpsRedirection();
    app.MapControllers();

    app.UseHangfireDashboard("/hangfire", new DashboardOptions
    {

    });
    app.Run();

}
catch (Exception ex)
{
    Log.Fatal(ex, ">>> SocialFlow terminated unexpectedly!");
}
finally
{
    Log.CloseAndFlush();
}