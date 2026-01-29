public interface INotificationService
{
    Task CreateNotificationForFollowersAsync(Guid authorId, Guid postId, CancellationToken cancellationToken);
}