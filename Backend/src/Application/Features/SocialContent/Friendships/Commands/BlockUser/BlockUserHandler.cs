using MediatR;

public class BlockUserHandler : IRequestHandler<BlockUserCommand, Result<Unit>>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICurrentUserService _currentUserService;

    public BlockUserHandler(IUnitOfWork unitOfWork, ICurrentUserService currentUserService)
    {
        _unitOfWork = unitOfWork;
        _currentUserService = currentUserService;
    }

    public async Task<Result<Unit>> Handle(BlockUserCommand request, CancellationToken cancellationToken)
    {
        var userSend = _currentUserService.UserId;
        if (userSend is null) return Result<Unit>.Failure(AuthErrors.Unauthorized);

        var userReceive = await _unitOfWork.Users.GetByIdAsync(request.BlockedUserId);
        if (userReceive is null) return Result<Unit>.Failure(UserErrors.NotFound);

        var friendship = await _unitOfWork.Friendships.GetRelationBetweenUsersAsync(userReceive.Id, userSend.Value);
        if (friendship is null)
        {
            var newFriendship = new Friendship(
            userSend.Value,
            userReceive.Id,
            userSend.Value,
            FriendshipStatus.None);

            newFriendship.UpdateBlock(userSend.Value, true);
            await _unitOfWork.Friendships.AddAsync(newFriendship);
        }
        else
        {
            friendship.UpdateBlock(userSend.Value, true);
        }

        await _unitOfWork.SaveChangesAsync();
        return Result<Unit>.Success(Unit.Value);
    }
}