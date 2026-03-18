using MediatR;
using SocialFlow.Domain.Events;

public class PostCreatedEventHandler : INotificationHandler<PostCreatedEvent>
{
    private readonly IJobService _jobService;

    public PostCreatedEventHandler(IJobService jobService)
    {
        _jobService = jobService;
    }

    public Task Handle(PostCreatedEvent notification, CancellationToken cancellationToken)
    {
        _jobService.Enqueue<INotificationService>(service =>
            service.CreateNotificationForFollowersAsync(
                notification.AuthorId,
                notification.PostId,
                cancellationToken)
        );
        return Task.CompletedTask;
    }
}