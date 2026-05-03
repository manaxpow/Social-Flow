using AutoMapper;
using MediatR;

namespace Shop.Application.Features.Placeholder.Commands.GetPostsByUserId;

public class GetPostsByUserIdHandler : IRequestHandler<GetPostsByUserIdQuery, Result<PagedList<PostDetailResponse>>>
{
    private readonly IMapper _mapper;
    private readonly IPostQueries _postQueries;
    private readonly ICurrentUserService _currentUserService;

    public GetPostsByUserIdHandler(IMapper mapper, IPostQueries postQueries, ICurrentUserService currentUserService)
    {
        _mapper = mapper;
        _postQueries = postQueries;
        _currentUserService = currentUserService;
    }

    public async Task<Result<PagedList<PostDetailResponse>>> Handle(GetPostsByUserIdQuery request, CancellationToken cancellationToken)
    {
        var userId = _currentUserService.UserId;
        if (userId == null) return Result<PagedList<PostDetailResponse>>.Failure(AuthErrors.Unauthorized);

        var posts = await _postQueries.GetPostsByUserIdAsync(userId.Value, request.PageNumber, request.PageSize, cancellationToken);
        return Result<PagedList<PostDetailResponse>>.Success(_mapper.Map<PagedList<PostDetailResponse>>(posts));
    }
}