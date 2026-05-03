public interface INotificationService
{
    Task CreateNotificationForFollowersAsync(Guid authorId, Guid postId, CancellationToken cancellationToken);

    Task CreateNotificationForMentionUserAsync(Guid authorID, Guid targetId, TargetType targetType, string message, NotificationType notificationType,
    List<Guid> mentionsId, CancellationToken cancellationToken);

    Task CreateNotificationForUser(Guid senderId, Guid receiverId, string message, NotificationType notificationType, CancellationToken cancellationToken);
}