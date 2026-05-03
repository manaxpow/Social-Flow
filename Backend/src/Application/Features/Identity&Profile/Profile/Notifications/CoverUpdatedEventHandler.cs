using MediatR;

public class CoverUpdatedEventHandler : INotificationHandler<CoverUpdatedEvent>
{
    private readonly IUnitOfWork _unitOfWork;

    public CoverUpdatedEventHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task Handle(CoverUpdatedEvent notification, CancellationToken cancellationToken)
    {
        var cover = new CloudAsset(notification.CoverUrl, notification.CoverPublicId, MediaType.Image);
        var post = Post.CreateCoverUpdatePost(notification.UserId, cover);

        await _unitOfWork.Posts.AddAsync(post);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}