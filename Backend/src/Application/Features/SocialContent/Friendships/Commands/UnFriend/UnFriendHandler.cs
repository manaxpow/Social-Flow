using MediatR;

public class UnFriendHandler : IRequestHandler<UnFriendCommand, Result<Unit>>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICurrentUserService _currentUserService;

    public UnFriendHandler(IUnitOfWork unitOfWork, ICurrentUserService currentUserService)
    {
        _unitOfWork = unitOfWork;
        _currentUserService = currentUserService;
    }

    public async Task<Result<Unit>> Handle(UnFriendCommand request, CancellationToken cancellationToken)
    {
        var userSend = _currentUserService.UserId;
        if (userSend is null) return Result<Unit>.Failure(AuthErrors.Unauthorized);

        var friendship = await _unitOfWork.Friendships.GetByUsersAsync(request.FriendId, userSend.Value);
        if (friendship is null) return Result<Unit>.Failure(FriendshipErrors.NotFound);
        if (friendship.Status != FriendshipStatus.Accepted) return Result<Unit>.Failure(FriendshipErrors.UnFriendFailed);

        if (!friendship.CanDeleted())
        {
            return Result<Unit>.Failure(FriendshipErrors.UnFriendFailed);
        }

        _unitOfWork.Friendships.Delete(friendship);
        await _unitOfWork.SaveChangesAsync();
        return Result<Unit>.Success(Unit.Value);
    }
}