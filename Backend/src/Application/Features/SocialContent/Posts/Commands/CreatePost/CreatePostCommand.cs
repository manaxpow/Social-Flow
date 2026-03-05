using MediatR;
using Microsoft.AspNetCore.Http;

public record CreatePostCommand(
    string Content,
    Guid? SharedPostId,
    List<IFormFile>? Files,
    List<Guid> MentionedUserIds
) : IRequest<Result<PostResponse>>;