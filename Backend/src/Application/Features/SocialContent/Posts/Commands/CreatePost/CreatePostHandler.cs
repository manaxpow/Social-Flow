using AutoMapper;
using MediatR;
using SocialFlow.Domain.Events;

public class CreatePostHandler : IRequestHandler<CreatePostCommand, Result<PostDetailResponse>>
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

    public async Task<Result<PostDetailResponse>> Handle(CreatePostCommand request, CancellationToken cancellationToken)
    {
        if (_currentUserService.UserId == null || !_currentUserService.IsAuthenticated)
            return Result<PostDetailResponse>.Failure(AuthErrors.Unauthorized);

        var postId = Guid.NewGuid();

        var mediaItems = request.Media?.Select(m => new PostMedia(
            postId,
            new CloudAsset(m.Url, m.PublicId, m.Type),
            m.SortOrder
        )).ToList();

        var post = new Post(
            postId,
            request.Content,
            _currentUserService.UserId.Value,
            mediaItems,
            request.SharedPostId,
            request.MentionedUserIds
        );

        post.AddDomainEvent(new PostCreatedEvent(post.Id, post.AuthorId, request.MentionedUserIds, request.SharedPostId));

        await _unitOfWork.Posts.AddAsync(post);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var response = _mapper.Map<PostDetailResponse>(post);
        var responseWithAuthor = response with
        {
            Author = new AuthorDto
            {
                Id = post.AuthorId,
            }
        };
        return Result<PostDetailResponse>.Success(responseWithAuthor);
    }
}
