using MediatR;

public class DecreaseCommentCountOnDeleteHandler : INotificationHandler<CommentDeletedEvent>
{
    private readonly IUnitOfWork _unitOfWork;

    public DecreaseCommentCountOnDeleteHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task Handle(CommentDeletedEvent notification, CancellationToken cancellationToken)
    {
        await _unitOfWork.Posts.DecreaseCommentCount(notification.PostId);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}