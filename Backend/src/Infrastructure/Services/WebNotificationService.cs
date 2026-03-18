using Microsoft.AspNetCore.SignalR;

public class WebNotificationService : IWebNotificationService
{
    private readonly IHubContext<NotificationHub, INotificationClient> _hubContext;

    public WebNotificationService(IHubContext<NotificationHub, INotificationClient> hubContext)
    {
        _hubContext = hubContext;
    }

    public async Task SendNotificationToUser(Guid userId, NotificationType type, object? data = null)
    {
        // Centralized logic: Ánh xạ từ Type sang Key/Template
        string titleKey = type switch
        {
            NotificationType.FriendRequestReceived => "NOTIF_FRIEND_REQ_RECEIVED",
            NotificationType.FriendRequestAccepted => "NOTIF_FRIEND_REQ_ACCEPTED",
            _ => "NOTIF_GENERAL"
        };

        var response = new NotificationResponse(type, titleKey, data, DateTime.UtcNow);

        await _hubContext.Clients.User(userId.ToString()).ReceiveNotification(response);
    }

    public Task SendNotificationToAll(NotificationType type, object data)
    {
        var response = new NotificationResponse(type, "NOTIF_GENERAL", data, DateTime.UtcNow);
        return _hubContext.Clients.All.ReceiveNotification(response);
    }
}