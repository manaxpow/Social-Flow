using MediatR;
using Microsoft.AspNetCore.Mvc;
using SocialFlow.Domain.Common;

[ApiController]
[Route("api/[controller]")]
public abstract class BaseApiController : ControllerBase
{

    private readonly IMediator _mediator;
    protected BaseApiController(IMediator mediator)
    {
        _mediator = mediator;
    }
    protected IActionResult HandleResult<T>(Result<T> result, string successMessage = "Success")
    {
        if (result.IsSuccess)
        {
            return Ok(new ApiResponse<T>(result.Value!, successMessage));
        }

        return BadRequest(new ApiResponse<object>(result.Error!));
    }
}