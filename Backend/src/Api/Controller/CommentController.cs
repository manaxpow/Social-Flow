using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

[Authorize]
public class CommentController(IMediator mediator, IMediaService mediaService) : BaseApiController(mediator)
{
    private readonly IMediaService _mediaService = mediaService;

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

    /// <summary>
    /// Get top-level comments (comments without parent) for a post using closure table
    /// </summary>
    [HttpGet("post/{postId:guid}/top-level")]
    public async Task<IActionResult> GetTopLevelComments(
        [FromRoute] Guid postId,
        [FromQuery] Guid? parentCommentId,
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 10
        )
    {
        var query = new GetCommentsByPostIdQuery(
            PostId: postId,
            parentCommentId: parentCommentId,
            PageNumber: pageNumber,
            PageSize: pageSize
            );

        var result = await _mediator.Send(query);
        return HandleResult(result);
    }

    /// <summary>
    /// Get depth-1 replies for a specific comment using closure table
    /// </summary>
    [HttpGet("{commentId:guid}/replies")]
    public async Task<IActionResult> GetCommentReplies(
        [FromRoute] Guid commentId,
        [FromQuery] Guid postId,
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 10)
    {
        var query = new GetCommentRepliesQuery(
            CommentId: commentId,
            PostId: postId,
            PageNumber: pageNumber,
            PageSize: pageSize);

        var result = await _mediator.Send(query);
        return HandleResult(result);
    }
}
