using AutoMapper;
using MediatR;

public class CreateCommentHandler : IRequestHandler<CreateCommentCommand, Result<CommentResponse>>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICurrentUserService _currentUserService;
    private readonly IMapper _mapper;

    public CreateCommentHandler(IUnitOfWork unitOfWork, ICurrentUserService currentUserService, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _currentUserService = currentUserService;
        _mapper = mapper;
    }

    public async Task<Result<CommentResponse>> Handle(CreateCommentCommand request, CancellationToken cancellationToken)
    {
        if (!await _unitOfWork.Posts.ExistsAsync(request.PostId, cancellationToken))
        {
            return Result<CommentResponse>.Failure(PostErrors.NotFound);
        }

        if (_currentUserService.UserId == null)
        {
            return Result<CommentResponse>.Failure(AuthErrors.Unauthorized);
        }

        // create comment
        var comment = Comment.Create(request.PostId,
            _currentUserService.UserId.Value,
            request.ParentCommentId,
            request.Media,
            request.Content,
            request.MentionedUserIds);
        await _unitOfWork.Comments.AddAsync(comment);

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        // mapping
        var response = _mapper.Map<CommentResponse>(comment);
        return Result<CommentResponse>.Success(response);
    }
}
