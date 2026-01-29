using MediatR;

public record GetCommentsByPostIdQuery(
    Guid PostId,
    int PageNumber = 1,
    int PageSize = 10
) : IRequest<Result<PagedList<CommentResponse>>>;