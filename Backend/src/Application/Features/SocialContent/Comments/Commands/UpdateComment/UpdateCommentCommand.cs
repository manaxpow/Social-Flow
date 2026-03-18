
using MediatR;

public record UpdateCommentCommand(
    Guid Id,
    string Content
) : IRequest<Result<CommentResponse>>;