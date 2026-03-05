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

    [HttpPut("avatar")]
    public async Task<IActionResult> UpdateAvatar([FromForm] UpdateAvatarCommand command)
    {
        var result = await _mediator.Send(command);
        return HandleResult(result);
    }


}