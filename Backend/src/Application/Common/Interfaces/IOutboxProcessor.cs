public interface IOutboxProcessor
{
    Task Process();
}