using MediatR;

public record GetPostsByUserIdQuery(Guid UserId, int PageNumber, int PageSize) : IRequest<Result<PagedList<PostResponse>>>;