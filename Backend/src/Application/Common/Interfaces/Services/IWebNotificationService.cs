public interface IWebNotificationService
{
    Task SendNotificationToUser(Guid userId, NotificationType type, object data);
    Task SendNotificationToAll(NotificationType type, object data);
}