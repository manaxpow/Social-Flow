using System.Linq.Expressions;
using Hangfire;

public class JobService : IJobService
{
    private readonly IBackgroundJobClient _backgroundJobClient;
    public JobService(IBackgroundJobClient backgroundJobClient)
    {
        _backgroundJobClient = backgroundJobClient;
    }
    public void Enqueue(Expression<Action> methodCall)
    {
        _backgroundJobClient.Enqueue(methodCall);
    }

    public void Enqueue<T>(Expression<Action<T>> methodCall)
    {
        _backgroundJobClient.Enqueue<T>(methodCall);
    }
}