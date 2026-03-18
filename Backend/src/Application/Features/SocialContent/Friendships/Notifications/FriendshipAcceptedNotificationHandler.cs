using MediatR;

public class FriendshipAcceptedNotificationHandler : INotificationHandler<FriendshipAcceptedEvent>
{
    private readonly IWebNotificationService _notificationService;
    private readonly IUserTracker _userTracker;
    private readonly IUnitOfWork _unitOfWork;

    public FriendshipAcceptedNotificationHandler(IWebNotificationService notificationService, IUserTracker userTracker, IUnitOfWork unitOfWork)
    {
        _notificationService = notificationService;
        _userTracker = userTracker;
        _unitOfWork = unitOfWork;
    }

    public async Task Handle(FriendshipAcceptedEvent notification, CancellationToken cancellationToken)
    {
        var notificationEntity = new Notification(
            notification.SenderId,
            notification.ReceiverId,
            "Your friend request has been accepted",
            NotificationType.FriendRequestAccepted,
            TargetType.Friendship,
            notification.FriendshipId);

        await _unitOfWork.Notifications.AddAsync(notificationEntity);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        bool isOnline = await _userTracker.IsUserOnline(notification.ReceiverId);
        if (isOnline)
        {
            await _notificationService.SendNotificationToUser(
                    notification.ReceiverId,
                    NotificationType.FriendRequestAccepted,
                    new
                    {
                        SenderId = notification.SenderId,
                        SenderName = notification.SenderName,
                        SenderAvatar = notification.SenderAvatar
                    });
        }
    }
}