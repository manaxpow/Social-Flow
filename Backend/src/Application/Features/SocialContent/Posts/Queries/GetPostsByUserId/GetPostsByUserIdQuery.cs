using MediatR;

public record GetPostsByUserIdQuery(int PageNumber, int PageSize) : IRequest<Result<PagedList<PostDetailReponse>>>;