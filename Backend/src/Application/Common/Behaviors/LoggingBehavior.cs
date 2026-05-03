using System.Diagnostics;
using MediatR;
using Microsoft.Extensions.Logging;

namespace SocialFlow.Application.Common.Behaviors;

public class LoggingBehavior<TRequest, TResponse>(ILogger<TRequest> logger)
    : IPipelineBehavior<TRequest, TResponse> where TRequest : IRequest<TResponse>
{
    public async Task<TResponse> Handle(TRequest request, RequestHandlerDelegate<TResponse> next, CancellationToken cancellationToken)
    {
        var requestName = typeof(TRequest).Name;

        var timer = Stopwatch.StartNew();

        logger.LogInformation("SocialFlow Request: {Name} starting...", requestName);

        try
        {
            var response = await next();

            timer.Stop();
            var elapsedMilliseconds = timer.ElapsedMilliseconds;

            logger.LogInformation("SocialFlow Request: {Name} finished in {Elapsed}ms.",
                requestName, elapsedMilliseconds);

            return response;
        }
        catch (Exception ex)
        {
            timer.Stop();
            logger.LogError(ex, "SocialFlow Request: {Name} failed after {Elapsed}ms",
                requestName, timer.ElapsedMilliseconds);
            throw;
        }
    }
}