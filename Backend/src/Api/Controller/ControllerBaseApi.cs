using MediatR;
using Microsoft.AspNetCore.Mvc;
using SocialFlow.Domain.Common;

[ApiController]
[Route("api/[controller]")]
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
                return Ok(new ApiResponse<T>(result.Value));

            return NoContent();
        }

        var statusCode = result.GetStatusCode();

        return StatusCode(statusCode, new ProblemDetails
        {
            Status = statusCode,
            Title = result.Error.Code,
            Detail = result.Error.Description,
            Instance = TraceId,
            Extensions =
            {
                ["errorCode"] = result.Error.Code,
                ["errors"] = result.Errors // (Validation)
            }
        });
    }
}