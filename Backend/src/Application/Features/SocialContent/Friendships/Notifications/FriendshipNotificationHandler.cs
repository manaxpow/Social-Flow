using MediatR;

public class FriendshipNotificationHandler : INotificationHandler<FriendshipRequestEvent>, INotificationHandler<FriendshipAcceptedEvent>
{
    private readonly IWebNotificationService _notificationService;
    private readonly IUserTracker _userTracker;

    public FriendshipNotificationHandler(IWebNotificationService notificationService, IUserTracker userTracker)
    {
        _notificationService = notificationService;
        _userTracker = userTracker;
    }

    public async Task Handle(FriendshipRequestEvent notification, CancellationToken cancellationToken)
    {
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

    public async Task Handle(FriendshipAcceptedEvent notification, CancellationToken cancellationToken)
    {
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