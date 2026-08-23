using System.Text.Json;
using System.Text.Json.Serialization;
using Application;
using Hangfire;
using Infrastructure;
using Serilog;
using Serilog.Events;
using SocialFlow.Domain.Exceptions;

AppContext.SetSwitch("Npgsql.EnableLegacyTimestampBehavior", true);


var builder = WebApplication.CreateBuilder(args);

// Configure Telemetry
builder.Logging.ClearProviders();
builder.AddServiceDefaults();
builder.Host.AddLoggingConfiguration();

// Add services layer
builder.Services.AddInfrastructureServices(builder.Configuration);
builder.Services.AddApplicationServices();

builder.Services.AddSignalR();

builder.Services.AddCorsConfiguration(builder.Configuration, builder.Environment);

builder.Services.AddRateLimitConfiguration();

builder.Services.AddControllers().AddJsonOptions(options =>
{
    options.JsonSerializerOptions.PropertyNameCaseInsensitive = true;
    options.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
    options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter(JsonNamingPolicy.CamelCase, allowIntegerValues: true));
});

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddOpenApi();
builder.Services.AddSwaggerDocumentaion();

var app = builder.Build();


app.UseHttpsRedirection();
app.UseRouting();

app.UseMiddleware<CorrelationIdMiddleware>();

app.UseSerilogRequestLogging(options =>
{
    options.GetLevel = (httpContext, elapsed, ex) =>
    {
        if (httpContext.Response.StatusCode < 500 || ex is ValidationException)
            return LogEventLevel.Information;

        return LogEventLevel.Error;
    };
});

app.UseMiddleware<GlobalExceptionMiddleware>();

app.UseCors("SocialFlowCorsPolicy");
app.UseRateLimiter();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapDefaultEndpoints();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.UseSwagger();
    app.UseSwaggerUI(options =>
    {
        options.SwaggerEndpoint("/swagger/v1/swagger.json", "SocialFlow API v1");
        options.RoutePrefix = "swagger";
    });

    // Migration
    await app.UseSyncMigration();
}

app.UseHangfireDashboard("/hangfire", new DashboardOptions { });

app.MapHub<NotificationHub>("/hubs/notifications");

app.Services.UseBackgroundJobs();

app.Run();

public partial class Program { }
