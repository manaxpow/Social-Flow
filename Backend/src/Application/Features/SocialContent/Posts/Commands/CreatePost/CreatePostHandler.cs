using AutoMapper;
using MediatR;
using SocialFlow.Domain.Events;

public class CreatePostHandler : IRequestHandler<CreatePostCommand, Result<PostResponse>>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;
    private readonly ICurrentUserService _currentUserService;
    public CreatePostHandler(IUnitOfWork unitOfWork, ICurrentUserService currentUserService, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _currentUserService = currentUserService;
        _mapper = mapper;
    }

    public async Task<Result<PostResponse>> Handle(CreatePostCommand request, CancellationToken cancellationToken)
    {
        if (_currentUserService.UserId == null || !_currentUserService.IsAuthenticated)
            return Result<PostResponse>.Failure(AuthErrors.Unauthorized);

        var post = new Post(
            Guid.NewGuid(),
            request.Content,
            _currentUserService.UserId.Value,
            request.MediaUrl,
            request.SharedPostId,
            request.MentionedUserIds
            );

        post.AddDomainEvent(new PostCreatedEvent(post.Id, post.AuthorId, request.MentionedUserIds, request.SharedPostId));

        await _unitOfWork.Posts.AddAsync(post);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var response = _mapper.Map<PostResponse>(post);
        return Result<PostResponse>.Success(response);
    }
}
