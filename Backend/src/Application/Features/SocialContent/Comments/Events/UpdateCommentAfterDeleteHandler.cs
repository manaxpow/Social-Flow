using MediatR;

public class UpdateCommentAfterDeleteHandler : INotificationHandler<CommentDeletedEvent>
{
    private readonly IUnitOfWork _uow;

    public UpdateCommentAfterDeleteHandler(IUnitOfWork unitOfWork)
    {
        _uow = unitOfWork;
    }

    public async Task Handle(CommentDeletedEvent notification, CancellationToken cancellationToken)
    {
        var comment = await _uow.Comments.GetCommentDeletedByIdAsync(notification.Id, cancellationToken);
        if (comment is null) return;

        // Comment has descendant have to rebin sub tree
        if (comment.ReplyCount > 0)
        {
            await _uow.Comments.RebindSubtree(comment);
        }
        else if (comment.ParentCommentId is not null)
        {
            await _uow.Comments.DecreaseReplyCountAsync(comment.ParentCommentId.Value, 1, cancellationToken);
        }

        await _uow.SaveChangesAsync(cancellationToken);
    }
}