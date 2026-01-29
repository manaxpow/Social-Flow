using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

[Authorize]
public class CommentController(IMediator mediator) : BaseApiController(mediator)
{
    [HttpPost("")]
    public async Task<IActionResult> CreateComment([FromBody] CreateCommentCommand command)
    {
        var result = await _mediator.Send(command);
        return HandleResult(result);
    }

    [HttpPatch("{id:guid}")]
    public async Task<IActionResult> UpdateComment([FromRoute] Guid id, [FromBody] UpdateCommentCommand command)
    {
        var commandWithId = command with { Id = id };
        var result = await _mediator.Send(commandWithId);
        return HandleResult(result);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteComment([FromRoute] Guid id)
    {
        var command = new DeleteCommentCommand(id);
        var result = await _mediator.Send(command);
        return HandleResult(result);
    }
}