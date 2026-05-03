using MediatR;

public class IncreaseReplyCountOnCreate : INotificationHandler<CommentCreatedEvent>
{
    private readonly IUnitOfWork _uow;

    public IncreaseReplyCountOnCreate(IUnitOfWork unitOfWork)
    {
        _uow = unitOfWork;
    }
    public async Task Handle(CommentCreatedEvent notification, CancellationToken cancellationToken)
    {
        if (notification.ParentCommentId != null)
        {
            await _uow.Comments.IncreaseReplyCountAsync(notification.ParentCommentId.Value);
        }
    }
}