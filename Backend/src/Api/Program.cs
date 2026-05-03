using System.Text.Json;
using System.Text.Json.Serialization;
using System.Threading.RateLimiting;
using Application;
using Hangfire;
using Infrastructure;
using Microsoft.AspNetCore.RateLimiting;
using Serilog;
using Serilog.Events;
using SocialFlow.Domain.Exceptions;

AppContext.SetSwitch("Npgsql.EnableLegacyTimestampBehavior", true);

Log.Logger = new LoggerConfiguration()
    .MinimumLevel.Override("Microsoft", LogEventLevel.Information)
    .Enrich.FromLogContext()
    .WriteTo.Console()
    .CreateBootstrapLogger();

try
{
    var builder = WebApplication.CreateBuilder(args);

    builder.Host.UseSerilog((context, services, configuration) => configuration
      .ReadFrom.Configuration(context.Configuration)
      .ReadFrom.Services(services)
      .Enrich.FromLogContext());

    Log.Information(">>> SocialFlow Backend is starting up...");

    // Add services layer   
    builder.Services.AddInfrastructureServices(builder.Configuration);
    builder.Services.AddApplicationServices();

    builder.Services.AddSignalR();

    var origins = builder.Configuration.GetSection("AllowedOrigins").Get<string[]>() ?? Array.Empty<string>();
    builder.Services.AddCors(options =>
    {
        options.AddPolicy("SocialFlowCorsPolicy", policy =>
        {
            if (origins != null && origins.Length > 0)
            {
                policy.WithOrigins(origins)
                    .AllowAnyHeader()
                    .AllowAnyMethod()
                    .AllowCredentials();
            }
            else if (builder.Environment.IsDevelopment())
            {
                policy.SetIsOriginAllowed(origin => true)
                    .AllowAnyHeader()
                    .AllowAnyMethod()
                    .AllowCredentials();

                Log.Warning(">>> CORS is allowing any origin with credentials. Ensure this is only for Dev.");
            }
        });
    });

    builder.Services.AddRateLimiter(options =>
    {
        options.AddFixedWindowLimiter(policyName: "fixed", options =>
        {
            options.PermitLimit = 100;
            options.Window = TimeSpan.FromMinutes(1);
            options.QueueLimit = 2;
            options.QueueProcessingOrder = QueueProcessingOrder.OldestFirst;
        });

        options.OnRejected = async (context, token) =>
        {
            context.HttpContext.Response.StatusCode = StatusCodes.Status429TooManyRequests;
            await context.HttpContext.Response.WriteAsync("Too many requests. Please try again later.", token);
        };
    });

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

    app.UseSerilogRequestLogging(options =>
    {
        options.GetLevel = (httpContext, elapsed, ex) =>
        {
            if (httpContext.Response.StatusCode < 500 || ex is ValidationException)
                return LogEventLevel.Information;

            return LogEventLevel.Error;
        };
    });


    app.UseCors("SocialFlowCorsPolicy");

    app.UseHttpsRedirection();

    app.UseRouting();

    app.UseRateLimiter();

    app.UseAuthentication();
    app.UseAuthorization();

    app.UseMiddleware<CorrelationIdMiddleware>();
    app.UseMiddleware<GlobalExceptionMiddleware>();

    app.MapControllers();

    if (app.Environment.IsDevelopment())
    {
        app.MapOpenApi();
        app.UseSwagger();
        app.UseSwaggerUI(options =>
        {
            options.SwaggerEndpoint("/swagger/v1/swagger.json", "SocialFlow API v1");
            options.RoutePrefix = "swagger";
        });
    }

    app.UseHangfireDashboard("/hangfire", new DashboardOptions { });

    app.MapHub<NotificationHub>("/hubs/notifications");

    app.Services.UseBackgroundJobs();

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

public partial class Program { }