using AutoMapper;
using MediatR;

public class UpdatePostHandler : IRequestHandler<UpdatePostCommand, Result<PostResponse>>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;
    private readonly ICurrentUserService _currentUserService;

    public UpdatePostHandler(IUnitOfWork unitOfWork, IMapper mapper, ICurrentUserService currentUserService)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
        _currentUserService = currentUserService;
    }

    public async Task<Result<PostResponse>> Handle(UpdatePostCommand request, CancellationToken cancellationToken)
    {
        var post = await _unitOfWork.Posts.GetByIdAsync(request.Id);
        if (post is null) return Result<PostResponse>.Failure(PostErrors.NotFound);

        if (post.AuthorId != _currentUserService.UserId) return Result<PostResponse>.Failure(AuthErrors.Unauthorized);

        post.Content = request.Content ?? post.Content;
        post.MediaUrl = request.MediaUrl ?? post.MediaUrl;

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var response = _mapper.Map<PostResponse>(post);
        return Result<PostResponse>.Success(response);
    }
}