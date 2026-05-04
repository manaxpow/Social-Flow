using MediatR;

public class DeletePostHandler : IRequestHandler<DeletePostCommand, Result<Unit>>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICurrentUserService _currentUserService;

    public DeletePostHandler(IUnitOfWork unitOfWork, ICurrentUserService currentUserService)
    {
        _unitOfWork = unitOfWork;
        _currentUserService = currentUserService;
    }

    public async Task<Result<Unit>> Handle(DeletePostCommand request, CancellationToken cancellationToken)
    {
        var post = await _unitOfWork.Posts.GetByIdAsync(request.Id);
        if (post is null) return Result<Unit>.Failure(PostErrors.NotFound);

        if (post.AuthorId != _currentUserService.UserId) return Result<Unit>.Failure(AuthErrors.Unauthorized);

        await _unitOfWork.Posts.Delete(post);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return Result<Unit>.Success(Unit.Value);
    }
}