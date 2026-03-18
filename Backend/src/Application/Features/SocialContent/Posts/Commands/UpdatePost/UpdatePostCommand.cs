
using MediatR;

public record UpdatePostCommand(
    Guid Id,
    string? Content,
    string? MediaUrl,
    List<Guid> MentionedUserIds
) : IRequest<Result<PostResponse>>;