using MediatR;
using Microsoft.AspNetCore.SignalR;

public class RequestFriendshipHandler : IRequestHandler<RequestFriendshipCommand, Result<Unit>>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICurrentUserService _currentUserService;

    public RequestFriendshipHandler(IUnitOfWork unitOfWork, ICurrentUserService currentUserService)
    {
        _unitOfWork = unitOfWork;
        _currentUserService = currentUserService;
    }


    public async Task<Result<Unit>> Handle(RequestFriendshipCommand request, CancellationToken cancellationToken)
    {
        var userSend = _currentUserService.UserId;
        if (userSend is null) return Result<Unit>.Failure(AuthErrors.Unauthorized);
        if (userSend.Value == request.FriendId) return Result<Unit>.Failure(FriendshipErrors.RequestYourself);

        var sender = await _unitOfWork.Users.GetByIdAsync(userSend.Value);
        if (sender is null) return Result<Unit>.Failure(UserErrors.NotFound);

        var userReceive = await _unitOfWork.Users.GetByIdAsync(request.FriendId);
        if (userReceive is null) return Result<Unit>.Failure(UserErrors.NotFound);

        var friendship = new Friendship(
            userSend.Value,
            userReceive.Id,
            userSend.Value,
            sender.FirstName + " " + sender.LastName,
            sender.AvatarUrl ?? string.Empty,
            FriendshipStatus.Pending);

        await _unitOfWork.Friendships.AddAsync(friendship);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return Result<Unit>.Success(Unit.Value);
    }
}