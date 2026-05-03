using MediatR;

public class AcceptFriendshipHandler : IRequestHandler<AcceptFriendshipCommand, Result<Unit>>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICurrentUserService _currentUserService;

    public AcceptFriendshipHandler(IUnitOfWork unitOfWork, ICurrentUserService currentUserService)
    {
        _currentUserService = currentUserService;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<Unit>> Handle(AcceptFriendshipCommand request, CancellationToken cancellationToken)
    {
        var acceptedUserId = _currentUserService.UserId;
        if (acceptedUserId is null) return Result<Unit>.Failure(AuthErrors.Unauthorized);

        var accepter = await _unitOfWork.Users.GetByIdAsync(acceptedUserId.Value);
        if (accepter is null) return Result<Unit>.Failure(UserErrors.NotFound);

        var friendship = await _unitOfWork.Friendships.GetByUsersAsync(request.FriendId, acceptedUserId.Value);
        if (friendship is null) return Result<Unit>.Failure(FriendshipErrors.NotFound);
        if (friendship.Status != FriendshipStatus.Pending) return Result<Unit>.Failure(FriendshipErrors.AcceptFriendshipFailed);

        friendship.AcceptRequest(
            acceptedUserId.Value,
            accepter.FirstName + " " + accepter.LastName,
            accepter.Avatar?.Url ?? string.Empty);

        await _unitOfWork.SaveChangesAsync();
        return Result<Unit>.Success(Unit.Value);
    }
}