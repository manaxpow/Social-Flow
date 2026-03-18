using MediatR;

public class DeleteReactionHandler : IRequestHandler<DeleteReactionCommand, Result<Unit>>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICurrentUserService _currentUserService;
    public DeleteReactionHandler(IUnitOfWork unitOfWork, ICurrentUserService currentUserService)
    {
        _unitOfWork = unitOfWork;
        _currentUserService = currentUserService;
    }

    public async Task<Result<Unit>> Handle(DeleteReactionCommand request, CancellationToken cancellationToken)
    {
        var reaction = await _unitOfWork.Reactions.GetByIdAsync(request.Id);
        if (reaction == null) return Result<Unit>.Failure(ReactionErrors.NotFound);

        if (reaction.UserId != _currentUserService.UserId) return Result<Unit>.Failure(AuthErrors.Unauthorized);

        _unitOfWork.Reactions.Delete(reaction);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return Result<Unit>.Success(Unit.Value);
    }
}