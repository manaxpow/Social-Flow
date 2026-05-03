using MediatR;

public record GetPostsByUserIdQuery(int PageNumber = 1, int PageSize = 10) : IRequest<Result<PagedList<PostDetailResponse>>>;