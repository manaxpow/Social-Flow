using System.Linq.Expressions;

public interface IJobService
{
    void Enqueue(Expression<Action> methodCall);
    void Enqueue<T>(Expression<Action<T>> methodCall);
}