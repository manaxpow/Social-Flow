using MediatR;
using Microsoft.AspNetCore.Mvc;

public class ReactionController(IMediator mediator) : BaseApiController(mediator)
{
    [HttpPost("")]
    public async Task<IActionResult> CreateReaction([FromBody] CreateReactionCommand command)
    {
        var result = await _mediator.Send(command);
        return HandleResult(result);
    }

    [HttpPatch("{id:guid}")]
    public async Task<IActionResult> UpdateReaction([FromRoute] Guid id, [FromBody] UpdateReactionCommand command)
    {
        var commandWithId = command with { Id = id };
        var result = await _mediator.Send(commandWithId);
        return HandleResult(result);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteReaction([FromRoute] Guid id)
    {
        var command = new DeleteReactionCommand(id);
        var result = await _mediator.Send(command);
        return HandleResult(result);
    }
}