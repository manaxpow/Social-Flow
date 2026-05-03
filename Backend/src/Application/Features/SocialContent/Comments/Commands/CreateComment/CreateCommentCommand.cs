
using MediatR;

public record CreateCommentCommand(
    Guid PostId,
    string? Content,
    CloudAsset? Media,
    List<Guid>? MentionedUserIds,
    Guid? ParentCommentId
) : IRequest<Result<CommentResponse>>;
