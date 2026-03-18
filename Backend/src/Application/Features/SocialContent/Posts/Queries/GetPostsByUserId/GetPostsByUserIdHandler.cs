using AutoMapper;
using MediatR;

namespace Shop.Application.Features.Placeholder.Commands.GetPostsByUserId;

public class GetPostsByUserIdHandler : IRequestHandler<GetPostsByUserIdQuery, Result<PagedList<PostResponse>>>
{
    private readonly IMapper _mapper;
    private readonly IPostQueries _postQueries;

    public GetPostsByUserIdHandler(IMapper mapper, IPostQueries postQueries)
    {
        _mapper = mapper;
        _postQueries = postQueries;
    }

    public async Task<Result<PagedList<PostResponse>>> Handle(GetPostsByUserIdQuery request, CancellationToken cancellationToken)
    {
        var posts = await _postQueries.GetPostsByUserIdAsync(request.UserId, request.PageNumber, request.PageSize, cancellationToken);
        return Result<PagedList<PostResponse>>.Success(_mapper.Map<PagedList<PostResponse>>(posts));
    }
}