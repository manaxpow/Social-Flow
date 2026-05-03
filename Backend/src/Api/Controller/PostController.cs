using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
[Authorize]
public class PostController(IMediator mediator) : BaseApiController(mediator)
{

    [HttpGet("my-posts")]
    public async Task<IActionResult> GetMyPosts([FromQuery] GetPostsByUserIdQuery query)
    {
        var result = await _mediator.Send(query);
        return HandleResult(result);
    }

    [HttpGet("{id:guid}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetPostById([FromRoute] Guid id)
    {
        var result = await _mediator.Send(new GetPostByIdQuery(id));
        return HandleResult(result);
    }

    [HttpPost("")]
    public async Task<IActionResult> CreatePost([FromBody] CreatePostCommand command)
    {
        var result = await _mediator.Send(command);
        return HandleResult(result);
    }

    [HttpPatch("{id:guid}")]
    public async Task<IActionResult> UpdatePost([FromRoute] Guid id, [FromBody] UpdatePostCommand command)
    {
        var commandWithId = command with { Id = id };
        var result = await _mediator.Send(commandWithId);
        return HandleResult(result);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeletePost([FromRoute] Guid id)
    {
        var command = new DeletePostCommand(id);
        var result = await _mediator.Send(command);
        return HandleResult(result);
    }
}