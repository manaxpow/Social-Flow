using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

[Authorize]
public class FriendshipController(IMediator mediator) : BaseApiController(mediator)
{
    [HttpPost("{userId:guid}/request")]
    public async Task<IActionResult> RequestFriendship([FromRoute] Guid userId)
    {
        var command = new RequestFriendshipCommand(userId);
        var result = await _mediator.Send(command);
        return HandleResult(result);
    }

    [HttpPatch("{userId:guid}/accept")]
    public async Task<IActionResult> AcceptFriendship([FromRoute] Guid userId)
    {
        var result = await _mediator.Send(new AcceptFriendshipCommand(userId));
        return HandleResult(result);
    }

    [HttpPatch("{userId:guid}/unfriend")]
    public async Task<IActionResult> UnFriend([FromRoute] Guid userId)
    {
        var result = await _mediator.Send(new UnFriendCommand(userId));
        return HandleResult(result);
    }

    [HttpPost("{userId:guid}/cancel")]
    public async Task<IActionResult> CancelFriendship([FromRoute] Guid userId)
    {
        var result = await _mediator.Send(new CancelFriendshipCommand(userId));
        return HandleResult(result);
    }

    [HttpPost("{userId:guid}/block")]
    public async Task<IActionResult> BlockUser([FromRoute] Guid userId)
    {
        var result = await _mediator.Send(new BlockUserCommand(userId));
        return HandleResult(result);
    }

    [HttpPost("{userId:guid}/unblock")]
    public async Task<IActionResult> UnblockUser([FromRoute] Guid userId)
    {
        var result = await _mediator.Send(new UnBlockUserCommand(userId));
        return HandleResult(result);
    }


}