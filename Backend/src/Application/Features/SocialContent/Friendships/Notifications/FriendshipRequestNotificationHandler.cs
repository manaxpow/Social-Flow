using MediatR;

public class FriendshipRequestNotificationHandler : INotificationHandler<FriendshipRequestEvent>
{
    private readonly IWebNotificationService _notificationService;
    private readonly IUserTracker _userTracker;
    private readonly IUnitOfWork _unitOfWork;

    public FriendshipRequestNotificationHandler(IWebNotificationService notificationService, IUserTracker userTracker, IUnitOfWork unitOfWork)
    {
        _notificationService = notificationService;
        _userTracker = userTracker;
        _unitOfWork = unitOfWork;
    }

    public async Task Handle(FriendshipRequestEvent notification, CancellationToken cancellationToken)
    {
        var notificationEntity = new Notification(
            notification.SenderId,
            notification.ReceiverId,
            "You have a new friend request",
            NotificationType.FriendRequestReceived,
            TargetType.Friendship,
            notification.FriendshipId);

        await _unitOfWork.Notifications.AddAsync(notificationEntity);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        bool isOnline = await _userTracker.IsUserOnline(notification.ReceiverId);
        if (isOnline)
        {
            await _notificationService.SendNotificationToUser(
                    notification.ReceiverId,
                    NotificationType.FriendRequestReceived,
                    new
                    {
                        SenderId = notification.SenderId,
                        SenderName = notification.SenderName,
                        SenderAvatar = notification.SenderAvatar
                    });
        }
    }
}