using AutoMapper;
using MediatR;

namespace Shop.Application.Features.Placeholder.Commands.GetPostsByUserId;

public class GetPostsByUserIdHandler : IRequestHandler<GetPostsByUserIdQuery, Result<PagedList<PostDetailReponse>>>
{
    private readonly IMapper _mapper;
    private readonly IPostRepository _postRepository;
    private readonly ICurrentUserService _currentUserService;

    public GetPostsByUserIdHandler(IMapper mapper, IPostRepository postRepository, ICurrentUserService currentUserService)
    {
        _mapper = mapper;
        _postRepository = postRepository;
        _currentUserService = currentUserService;
    }

    public async Task<Result<PagedList<PostDetailReponse>>> Handle(GetPostsByUserIdQuery request, CancellationToken cancellationToken)
    {
        var currentUserId = _currentUserService.UserId;

        if (currentUserId == null)
        {
            return Result<PagedList<PostDetailReponse>>.Failure(AuthErrors.Unauthorized);
        }
        var posts = await _postRepository.GetPostsByUserIdAsync(currentUserId.Value, request.PageNumber, request.PageSize, cancellationToken);
        return Result<PagedList<PostDetailReponse>>.Success(_mapper.Map<PagedList<PostDetailReponse>>(posts));
    }
}