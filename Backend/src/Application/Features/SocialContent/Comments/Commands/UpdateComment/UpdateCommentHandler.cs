using AutoMapper;
using MediatR;

public class UpdateCommentHandler : IRequestHandler<UpdateCommentCommand, Result<CommentResponse>>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICurrentUserService _currentUserService;
    private readonly IMapper _mapper;

    public UpdateCommentHandler(IUnitOfWork unitOfWork, IMapper mapper, ICurrentUserService currentUserService)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
        _currentUserService = currentUserService;
    }

    public async Task<Result<CommentResponse>> Handle(UpdateCommentCommand request, CancellationToken cancellationToken)
    {
        var comment = await _unitOfWork.Comments.GetByIdAsync(request.Id);
        if (comment == null) return Result<CommentResponse>.Failure(CommentErrors.NotFound);

        if (comment.AuthorId != _currentUserService.UserId)
            return Result<CommentResponse>.Failure(AuthErrors.Unauthorized);

        comment.UpdateContent(request.Content);
        comment.UpdateMedia(request.Media);
        comment.UpdateMentions(request.MentionedUserIds);

        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return Result<CommentResponse>.Success(_mapper.Map<CommentResponse>(comment));
    }
}