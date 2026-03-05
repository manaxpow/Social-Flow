using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
[Authorize]
public class PostController(IMediator mediator) : BaseApiController(mediator)
{
    // Đổi [FromBody] thành [FromForm] để nhận Files
    [HttpPost]
    public async Task<IActionResult> CreatePost([FromForm] CreatePostCommand command)
    {
        // Khi dùng FromForm, command.Files sẽ tự động được ánh xạ từ các file gửi lên
        var result = await _mediator.Send(command);
        return HandleResult(result);
    }

    [HttpPatch("{id:guid}")]
    public async Task<IActionResult> UpdatePost([FromRoute] Guid id, [FromForm] UpdatePostCommand command)
    {
        // Sử dụng 'with' để gán Id từ Route vào Record Command
        var commandWithId = command with { Id = id };
        var result = await _mediator.Send(commandWithId);
        return HandleResult(result);
    }

    // Các hàm Get/Delete giữ nguyên vì không nhận File
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeletePost([FromRoute] Guid id)
    {
        var result = await _mediator.Send(new DeletePostCommand(id));
        return HandleResult(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetPostById([FromRoute] Guid id)
    {
        var result = await _mediator.Send(new GetPostByIdQuery(id));
        return HandleResult(result);
    }

    [HttpGet("my-posts")]
    public async Task<IActionResult> GetPosts([FromQuery] GetPostsByUserIdQuery query)
    {
        var result = await _mediator.Send(query);
        return HandleResult(result);
    }
}