using System.Text.Json.Serialization;
using System.Threading.RateLimiting;
using Application;
using Hangfire;
using Infrastructure;
using Microsoft.AspNetCore.RateLimiting;
using Serilog;

var builder = WebApplication.CreateBuilder(args);

Log.Logger = new LoggerConfiguration()
    .ReadFrom.Configuration(builder.Configuration)
    .Enrich.FromLogContext()
    .CreateLogger();


builder.Host.UseSerilog();


try
{
    Log.Information(">>> SocialFlow Backend is starting up...");

    // Add services layer   
    builder.Services.AddInfrastructureServices(builder.Configuration);
    builder.Services.AddApplicationServices();

    // Add cors

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
                policy.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod();
            }
        });
    });

    // Add rate limiter
    builder.Services.AddRateLimiter(options =>
    {
        options.AddFixedWindowLimiter(policyName: "fixed", options =>
        {
            options.PermitLimit = 100; // Số lượng request tối đa
            options.Window = TimeSpan.FromMinutes(1);
            options.QueueLimit = 2; // Số lượng request chờ trong hàng đợi
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
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
    });

    builder.Services.AddEndpointsApiExplorer();

    // Add swagger
    builder.Services.AddOpenApi();
    builder.Services.AddSwaggerDocumentaion();

    var app = builder.Build();

    app.UseCors("SocialFlowCorsPolicy");
    // Use global exception handling middleware
    app.UseMiddleware<CorrelationIdMiddleware>();
    app.UseMiddleware<GlobalExceptionMiddleware>();


    if (app.Environment.IsDevelopment())
    {
        app.MapOpenApi();
    }
    // Use Serilog request logging 
    app.UseSerilogRequestLogging();


    app.UseHttpsRedirection();

    app.UseRateLimiter();
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