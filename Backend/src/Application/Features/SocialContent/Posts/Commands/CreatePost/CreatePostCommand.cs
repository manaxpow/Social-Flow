
using MediatR;

public record CreatePostCommand(
    string? Content,
    IEnumerable<CreatePostMediaRequest>? Media,
    Guid? SharedPostId,
    List<Guid>? MentionedUserIds
) : IRequest<Result<PostDetailResponse>>;
