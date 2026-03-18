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
}