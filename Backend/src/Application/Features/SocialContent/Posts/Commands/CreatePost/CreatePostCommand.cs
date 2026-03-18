
using MediatR;

public record CreatePostCommand(
    string Content,
    string? MediaUrl,
    Guid? SharedPostId,
    List<Guid> MentionedUserIds
) : IRequest<Result<PostResponse>>;