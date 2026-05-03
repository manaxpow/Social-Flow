using MediatR;

public class IncreaseCommentCountOnCreate : INotificationHandler<CommentCreatedEvent>
{
    private readonly IUnitOfWork _unitOfWork;

    public IncreaseCommentCountOnCreate(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }
    public async Task Handle(CommentCreatedEvent notification, CancellationToken cancellationToken)
    {
        await _unitOfWork.Posts.IncreaseCommentCount(notification.PostId);
        await _unitOfWork.SaveChangesAsync();
    }
}