using AutoMapper;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;

public class UpdatePostHandler : IRequestHandler<UpdatePostCommand, Result<PostResponse>>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;
    private readonly ICurrentUserService _currentUserService;
    private readonly IAuthorizationService _authorizationService;

    public UpdatePostHandler(IUnitOfWork unitOfWork, IMapper mapper, ICurrentUserService currentUserService, IAuthorizationService authorizationService)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
        _currentUserService = currentUserService;
        _authorizationService = authorizationService;
    }

    public async Task<Result<PostResponse>> Handle(UpdatePostCommand request, CancellationToken cancellationToken)
    {
        var post = await _unitOfWork.Posts.GetByIdWithMediaAsync(request.Id);
        if (post is null) return Result<PostResponse>.Failure(PostErrors.NotFound);

        var authorizationResult = await _authorizationService.AuthorizeAsync(_currentUserService.User!, post, new IsOwnerRequirement());
        if (!authorizationResult.Succeeded) return Result<PostResponse>.Failure(AuthErrors.Forbidden);

        post.UpdateContent(request.Content ?? post.Content);

        if (request.Media != null)
        {
            var incomingAssets = request.Media
            .Select(m => new CloudAsset(m.Url, m.PublicId, m.Type))
            .ToList();

            post.UpdateMediaItems(incomingAssets);
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var response = _mapper.Map<PostResponse>(post);
        return Result<PostResponse>.Success(response);
    }
}
