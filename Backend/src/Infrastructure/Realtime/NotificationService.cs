public class NotificationService : INotificationService
{
    private readonly IUnitOfWork _unitOfWork;

    public NotificationService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }
    public async Task CreateNotificationForFollowersAsync(Guid authorId, Guid postId, CancellationToken cancellationToken)
    {
        var user = await _unitOfWork.Users.GetByIdAsync(authorId);
        if (user is not null)
        {

            var friendsId = await _unitOfWork.Friendships.GetFriendsAsync(authorId, cancellationToken);

            var notification = friendsId.Select(friend => new Notification(
                    friend,
                    authorId,
                    $"@{user.FirstName} {user.LastName} created a new post",
                    NotificationType.PostCreated,
                    TargetType.Post,
                    postId))
                    .ToList();

            await _unitOfWork.Notifications.AddRangeAsync(notification);
            await _unitOfWork.SaveChangesAsync(cancellationToken);
        }
    }

    public Task CreateNotificationForMentionUserAsync(Guid authorID, Guid targetId, TargetType targetType, string message, NotificationType notificationType, List<Guid> mentionsId, CancellationToken cancellationToken)
    {
        throw new NotImplementedException();
    }

    public async Task CreateNotificationForUser(Guid senderId, Guid receiverId, string message, NotificationType notificationType, CancellationToken cancellationToken)
    {
        var notification = new Notification(senderId, receiverId, message, notificationType);

        await _unitOfWork.Notifications.AddAsync(notification);
        await _unitOfWork.SaveChangesAsync();
    }
}