
using MediatR;

public record CreateCommentCommand(
    Guid PostId,
    string Content,
    Guid AuthorId,
    Guid? ParentCommentId
) : IRequest<Result<CommentResponse>>;