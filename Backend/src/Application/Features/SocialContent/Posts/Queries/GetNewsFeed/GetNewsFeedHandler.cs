using AutoMapper;
using MediatR;

namespace Shop.Application.Features.Placeholder.Commands.GetNewsFeed;

public class GetNewsFeedHandler : IRequestHandler<GetNewsFeedQuery, Result<PagedList<PostResponse>>>
{
    private readonly IMapper _mapper;
    private readonly IPostQueries _postQueries;

    public GetNewsFeedHandler(IMapper mapper, IPostQueries postQueries)
    {
        _mapper = mapper;
        _postQueries = postQueries;
    }

    public async Task<Result<PagedList<PostResponse>>> Handle(GetNewsFeedQuery request, CancellationToken cancellationToken)
    {
        var posts = await _postQueries.GetNewsFeedAsync(request.UserId, request.PageNumber, request.PageSize, cancellationToken);
        return Result<PagedList<PostResponse>>.Success(_mapper.Map<PagedList<PostResponse>>(posts));
    }
}