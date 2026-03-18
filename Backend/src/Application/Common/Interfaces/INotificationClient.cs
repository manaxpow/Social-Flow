public interface INotificationClient
{
    Task ReceiveNotification(NotificationResponse notification);
}