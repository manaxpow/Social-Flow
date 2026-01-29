using MediatR;

public record GetSearchPostsQuery(
    string SearchTerm,
    int PageNumber,
    int PageSize
) : IRequest<Result<PagedList<PostResponse>>>;