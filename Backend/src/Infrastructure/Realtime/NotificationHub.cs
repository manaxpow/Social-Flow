using Microsoft.AspNetCore.SignalR;

public class NotificationHub : Hub<INotificationClient>
{
    private readonly IUserTracker _userTracker;

    public NotificationHub(IUserTracker userTracker)
    {
        _userTracker = userTracker;
    }
    public override async Task OnConnectedAsync()
    {
        if (Guid.TryParse(Context.UserIdentifier, out var userId))
        {
            await _userTracker.AddConnection(userId, Context.ConnectionId);
        }
        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        if (Guid.TryParse(Context.UserIdentifier, out var userId))
        {
            await _userTracker.RemoveConnection(userId, Context.ConnectionId);
        }
        await base.OnDisconnectedAsync(exception);
    }

    public async Task JoinPostGroup(Guid postId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, $"Post_{postId}");
    }

    public async Task LeavePostGroup(Guid postId)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"Post_{postId}");
    }

    public async Task JoinCommentThread(Guid rootCommentId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, $"Thread_{rootCommentId}");
    }

    public async Task LeaveCommentThread(Guid rootCommentId)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"Thread_{rootCommentId}");
    }
}