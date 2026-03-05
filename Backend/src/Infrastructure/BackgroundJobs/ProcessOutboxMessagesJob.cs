using MediatR;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;

public class ProcessOutboxMessagesJob
{
    public readonly IOutboxRepository _outboxRepository;
    public readonly IPublisher _mediator;
    public readonly ILogger<ProcessOutboxMessagesJob> _logger;

    public ProcessOutboxMessagesJob(IOutboxRepository outboxRepository, IPublisher mediator, ILogger<ProcessOutboxMessagesJob> logger)
    {
        _outboxRepository = outboxRepository;
        _logger = logger;
        _mediator = mediator;
    }

    public async Task Process()
    {
        var messages = await _outboxRepository.GetUnpublishedMessagesAsync(20);

        foreach (var message in messages)
        {
            try
            {
                var domainEvent = JsonConvert.DeserializeObject<IDomainEvent>(message.Content, new JsonSerializerSettings
                {
                    TypeNameHandling = TypeNameHandling.All
                });

                if (domainEvent is null)
                {
                    _logger.LogWarning("Domain event is null");
                    message.UpdateError("Domain event is null");
                    continue;
                }

                await _mediator.Publish(domainEvent);
                message.MarkAsProcessed(DateTime.UtcNow);
            }
            catch (Exception ex)
            {
                message.MarkAsFailed(DateTime.UtcNow);
                message.UpdateError(ex.Message);
                _logger.LogError(ex, ex.Message);
            }
        }
    }

}