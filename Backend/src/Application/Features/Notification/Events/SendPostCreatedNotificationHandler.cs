using MediatR;
using SocialFlow.Domain.Events;

public class SendPostCreatedNotificationHandler : INotificationHandler<PostCreatedEvent>
{
    private readonly IJobService _jobService;
    private readonly IUnitOfWork _uow;


    public SendPostCreatedNotificationHandler(IJobService jobService, IUnitOfWork unitOfWork)
    {
        _jobService = jobService;
        _uow = unitOfWork;
    }

    public async Task Handle(PostCreatedEvent notification, CancellationToken cancellationToken)
    {
        var user = await _uow.Users.GetByIdAsync(notification.AuthorId);
        if (user == null) return;

        if (notification.MentionedUserIds != null)
        {
            _jobService.Enqueue<INotificationService>(service =>
              service.CreateNotificationForMentionUserAsync(
                  notification.AuthorId,
                  notification.PostId,
                  TargetType.Post,
                  $"@{user.FirstName} {user.LastName} mentioned you in a post",
                  NotificationType.Mention,
                  notification.MentionedUserIds,
                  cancellationToken
              ));
        }

    }
}