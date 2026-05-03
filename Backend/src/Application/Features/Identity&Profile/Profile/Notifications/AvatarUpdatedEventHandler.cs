using MediatR;

public class AvatarUpdatedEventHandler : INotificationHandler<AvatarUpdatedEvent>
{
    private readonly IUnitOfWork _unitOfWork;

    public AvatarUpdatedEventHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task Handle(AvatarUpdatedEvent notification, CancellationToken cancellationToken)
    {
        var avatar = new CloudAsset(notification.AvatarUrl, notification.PublicId, MediaType.Image);
        var post = Post.CreateAvatarUpdatePost(notification.UserId, avatar);

        await _unitOfWork.Posts.AddAsync(post);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}