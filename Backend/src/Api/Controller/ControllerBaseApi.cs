using System.Text.Json;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

[ApiController]
[Route("api/[controller]")]
[EnableRateLimiting("fixed")]
public abstract class BaseApiController : ControllerBase
{
    protected readonly IMediator _mediator;
    protected string TraceId => HttpContext.TraceIdentifier;
    protected BaseApiController(IMediator mediator)
    {
        _mediator = mediator;
    }
    protected IActionResult HandleResult<T>(Result<T> result)
    {
        if (result.IsSuccess)
        {
            if (result.Value is not null)
                return Ok(result.Value);

            return NoContent();
        }

        var statusCode = result.GetStatusCode();

        var problemDetails = new ProblemDetails
        {
            Status = statusCode,
            Title = result.Error.Code,
            Detail = result.Error.Description,
            Instance = TraceId,
            Extensions =
            {
                ["errorCode"] = result.Error.Code
            }
        };

        if (result.Errors is not null)
        {
            problemDetails.Extensions["errors"] = result.Errors;
        }

        if (result.Metadata is not null)
        {
            var properties = result.Metadata.GetType().GetProperties();
            foreach (var prop in properties)
            {
                var key = JsonNamingPolicy.CamelCase.ConvertName(prop.Name);
                var value = prop.GetValue(result.Metadata);

                problemDetails.Extensions[key] = value;
            }
        }

        return StatusCode(statusCode, problemDetails);
    }
}