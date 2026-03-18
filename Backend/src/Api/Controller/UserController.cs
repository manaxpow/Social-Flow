using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

[Authorize]
public class UserController(IMediator _mediator) : BaseApiController(_mediator)
{
    [HttpGet("me")]
    public async Task<IActionResult> GetMe()
    {
        var result = await _mediator.Send(new GetMeQuery());
        return HandleResult(result);
    }
}