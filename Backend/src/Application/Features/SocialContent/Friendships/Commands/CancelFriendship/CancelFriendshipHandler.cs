using MediatR;

public class CancelFriendshipHandler : IRequestHandler<CancelFriendshipCommand, Result<Unit>>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICurrentUserService _currentUserService;

    public CancelFriendshipHandler(IUnitOfWork unitOfWork, ICurrentUserService currentUserService)
    {
        _unitOfWork = unitOfWork;
        _currentUserService = currentUserService;
    }

    public async Task<Result<Unit>> Handle(CancelFriendshipCommand request, CancellationToken cancellationToken)
    {
        var userSend = _currentUserService.UserId;
        if (userSend is null) return Result<Unit>.Failure(AuthErrors.Unauthorized);

        var friendship = await _unitOfWork.Friendships.GetByUsersAsync(request.FriendId, userSend.Value);
        if (friendship is null) return Result<Unit>.Failure(FriendshipErrors.NotFound);

        if (friendship.Status != FriendshipStatus.Pending)
        {
            return Result<Unit>.Failure(FriendshipErrors.CancelFriendshipFailed);
        }

        if (friendship.CanDeleted())
        {
            await _unitOfWork.Friendships.Delete(friendship);
        }
        // case when both users blocked each other
        else
        {
            friendship.UpdateStatus(FriendshipStatus.Blocked);
        }

        await _unitOfWork.SaveChangesAsync();
        return Result<Unit>.Success(Unit.Value);
    }
}