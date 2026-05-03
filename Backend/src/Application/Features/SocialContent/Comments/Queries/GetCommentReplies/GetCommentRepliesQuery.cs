using MediatR;

public record GetCommentRepliesQuery(
    Guid CommentId,
    Guid PostId,
    int PageNumber = 1,
    int PageSize = 10
) : IRequest<Result<PagedList<CommentResponse>>>;
