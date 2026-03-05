using AutoMapper;
using MediatR;

namespace Shop.Application.Features.Placeholder.Commands.GetNewsFeed;

public class GetNewsFeedHandler : IRequestHandler<GetNewsFeedQuery, Result<PagedList<PostResponse>>>
{
    private readonly IMapper _mapper;
    private readonly IPostRepository _postRepository;

    public GetNewsFeedHandler(IMapper mapper, IPostRepository postRepository)
    {
        _mapper = mapper;
        _postRepository = postRepository;
    }

    public async Task<Result<PagedList<PostResponse>>> Handle(GetNewsFeedQuery request, CancellationToken cancellationToken)
    {
        var posts = await _postRepository.GetNewsFeedAsync(request.UserId, request.PageNumber, request.PageSize, cancellationToken);
        return Result<PagedList<PostResponse>>.Success(_mapper.Map<PagedList<PostResponse>>(posts));
    }
}