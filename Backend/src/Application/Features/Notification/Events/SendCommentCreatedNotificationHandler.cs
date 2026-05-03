using MediatR;

public class SendCommentCreatedNotificationHandler : INotificationHandler<CommentCreatedEvent>
{
    private readonly IJobService _jobService;
    private readonly IUnitOfWork _uow;

    public SendCommentCreatedNotificationHandler(IJobService jobService, IUnitOfWork unitOfWork)
    {
        _jobService = jobService;
        _uow = unitOfWork;
    }
    public async Task Handle(CommentCreatedEvent notification, CancellationToken cancellationToken)
    {
        var author = await _uow.Users.GetByIdAsync(notification.AuthorId);
        if (author == null) return;

        if (notification.AuthorParentCommentId.HasValue)
        {
            var parentAuthorExists = await _uow.Users.GetByIdAsync(notification.AuthorParentCommentId.Value);

            if (parentAuthorExists != null && notification.AuthorId != notification.AuthorParentCommentId)
            {
                bool isAlreadyMentioned = notification.MentionedUserIds?.Contains(notification.AuthorParentCommentId.Value) ?? false;

                if (!isAlreadyMentioned)
                {
                    _jobService.Enqueue<INotificationService>(service =>
                        service.CreateNotificationForUser(
                            notification.AuthorId,
                            notification.AuthorParentCommentId.Value,
                            $"@{author.FirstName} {author.LastName} replied to your comment",
                            NotificationType.Reply,
                            cancellationToken
                        ));
                }
            }
        }

        if (notification.MentionedUserIds?.Any() == true)
        {
            _jobService.Enqueue<INotificationService>(service =>
               service.CreateNotificationForMentionUserAsync(
                   notification.AuthorId,
                   notification.Id,
                   TargetType.Comment,
                   $"@{author.FirstName} {author.LastName} mentioned you in a comment",
                   NotificationType.Mention,
                   notification.MentionedUserIds,
                   cancellationToken
               ));
        }
    }
}