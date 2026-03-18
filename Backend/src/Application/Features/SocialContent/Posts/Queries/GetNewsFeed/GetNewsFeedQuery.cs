using MediatR;

public record GetNewsFeedQuery(Guid UserId, int PageNumber, int PageSize) : IRequest<Result<PagedList<PostResponse>>>;