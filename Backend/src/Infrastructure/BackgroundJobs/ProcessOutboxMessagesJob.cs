using MediatR;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;

public class ProcessOutboxMessagesJob : IOutboxProcessor
{
    public readonly IUnitOfWork _unitOfWork;
    public readonly IPublisher _mediator;
    public readonly ILogger<ProcessOutboxMessagesJob> _logger;

    public ProcessOutboxMessagesJob(IUnitOfWork unitOfWork, IPublisher mediator, ILogger<ProcessOutboxMessagesJob> logger)
    {
        _unitOfWork = unitOfWork;
        _logger = logger;
        _mediator = mediator;
    }

    public async Task Process()
    {
        var messages = await _unitOfWork.OutboxMessages.GetUnpublishedMessagesAsync(20);

        if (messages == null || !messages.Any())
        {
            _logger.LogInformation("No outbox messages to process.");
            return;
        }
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
                await _unitOfWork.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                message.MarkAsFailed(DateTime.UtcNow);
                message.UpdateError(ex.Message);
                _logger.LogError(ex, ex.Message);
                await _unitOfWork.SaveChangesAsync();
            }
        }
    }

}