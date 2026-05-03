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

    [HttpGet("{id}")]
    public async Task<IActionResult> GetUserById(Guid id)
    {
        var result = await _mediator.Send(new GetUserByIdQuery(id));
        return HandleResult(result);
    }

    [HttpPost("avatar")]
    public async Task<IActionResult> UpdateAvatar([FromBody] UpdateAvatarCommand command)
    {
        var result = await _mediator.Send(command);
        return HandleResult(result);
    }

    [HttpPost("cover")]
    public async Task<IActionResult> UpdateCover([FromBody] UpdateCoverCommand command)
    {
        var result = await _mediator.Send(command);
        return HandleResult(result);
    }

    [HttpPatch("profile")]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileCommand command)
    {
        var result = await _mediator.Send(command);
        return HandleResult(result);
    }
}