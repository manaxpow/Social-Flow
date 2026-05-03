using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

[Authorize]
public class MediaController(IMediator mediator) : BaseApiController(mediator)
{
    [HttpGet("setup-upload")]
    public async Task<IActionResult> GetUploadSignature([FromQuery] string folder = "socialflow/posts")
    {
        var result = await _mediator.Send(new GetSetupUploadQuery(folder));
        return HandleResult(result);
    }

    [HttpDelete]
    public async Task<IActionResult> DeleteMedia(
        [FromQuery] string publicId,
        [FromQuery] MediaType mediaType = MediaType.Image)
    {
        var result = await _mediator.Send(new DeleteMediaCommand(publicId, mediaType));
        return HandleResult(result);
    }
}
