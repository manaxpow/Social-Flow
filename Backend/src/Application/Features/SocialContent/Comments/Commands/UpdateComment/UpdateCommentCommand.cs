
using MediatR;

public record UpdateCommentCommand(
    Guid Id,
    string? Content,
    CloudAsset? Media,
    List<Guid>? MentionedUserIds
) : IRequest<Result<CommentResponse>>;