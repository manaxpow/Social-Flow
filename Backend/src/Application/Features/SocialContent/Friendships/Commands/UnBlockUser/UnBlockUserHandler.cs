using MediatR;

public class UnBlockUserHandler : IRequestHandler<UnBlockUserCommand, Result<Unit>>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICurrentUserService _currentUserService;

    public UnBlockUserHandler(IUnitOfWork unitOfWork, ICurrentUserService currentUserService)
    {
        _unitOfWork = unitOfWork;
        _currentUserService = currentUserService;
    }

    public async Task<Result<Unit>> Handle(UnBlockUserCommand request, CancellationToken cancellationToken)
    {
        var userSend = _currentUserService.UserId;
        if (userSend is null) return Result<Unit>.Failure(AuthErrors.Unauthorized);

        var friendship = await _unitOfWork.Friendships.GetByUsersAsync(request.BlockedUserId, userSend.Value);
        if (friendship is null) return Result<Unit>.Failure(FriendshipErrors.NotFound);
        if (friendship.Status != FriendshipStatus.Blocked) return Result<Unit>.Failure(FriendshipErrors.UnBlockUserFailed);

        bool isCurrentlyBlocking = (friendship.UserId1 == userSend.Value && friendship.IsBlockedByUser1) ||
                                (friendship.UserId2 == userSend.Value && friendship.IsBlockedByUser2);

        if (!isCurrentlyBlocking) return Result<Unit>.Failure(FriendshipErrors.UnBlockUserFailed);

        friendship.UpdateBlock(userSend.Value, false);
        await _unitOfWork.SaveChangesAsync();
        return Result<Unit>.Success(Unit.Value);
    }
}