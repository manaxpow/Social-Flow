using AutoMapper;
using MediatR;

namespace Shop.Application.Features.Placeholder.Commands.GetSearchPosts;

public class GetSearchPostsHandler : IRequestHandler<GetSearchPostsQuery, Result<PagedList<PostResponse>>>
{
    private readonly IMapper _mapper;
    private readonly IPostQueries _postQueries;

    public GetSearchPostsHandler(IMapper mapper, IPostQueries postQueries)
    {
        _mapper = mapper;
        _postQueries = postQueries;
    }

    public async Task<Result<PagedList<PostResponse>>> Handle(GetSearchPostsQuery request, CancellationToken cancellationToken)
    {
        var posts = await _postQueries.GetSearchPostsAsync(request.SearchTerm, request.PageNumber, request.PageSize, cancellationToken);
        return Result<PagedList<PostResponse>>.Success(_mapper.Map<PagedList<PostResponse>>(posts));
    }
}