using MediatR;

public record UpdatePostCommand(
    Guid Id,
    string? Content,
    IEnumerable<CreatePostMediaRequest>? Media,
    List<Guid> MentionedUserIds
) : IRequest<Result<PostResponse>>;
