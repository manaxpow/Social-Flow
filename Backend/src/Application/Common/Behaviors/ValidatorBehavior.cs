using System.Text.Json;
using FluentValidation;
using MediatR;
using DomainValidationException = SocialFlow.Domain.Exceptions.ValidationException;

public class ValidatorBehavior<TRequest, TResponse>(IEnumerable<IValidator<TRequest>> validators)
    : IPipelineBehavior<TRequest, TResponse> where TRequest : IRequest<TResponse>
{
    public async Task<TResponse> Handle(TRequest request, RequestHandlerDelegate<TResponse> next, CancellationToken cancellationToken)
    {
        if (!validators.Any()) return await next();

        var context = new ValidationContext<TRequest>(request);

        // Run all validators for this request
        var validationResults = await Task.WhenAll(
            validators.Select(v => v.ValidateAsync(context, cancellationToken)));

        // Gather all errors
        var failures = validationResults
        .SelectMany(r => r.Errors)
        .Where(f => f != null)
        .GroupBy(
            x => x.PropertyName,
            x => x.ErrorMessage,
            (propertyName, errorMessages) => new
            {
                Key = JsonNamingPolicy.CamelCase.ConvertName(propertyName),
                Values = errorMessages.Distinct().ToArray()
            })
        .ToDictionary(x => x.Key, x => x.Values);

        if (failures.Count != 0)
        {
            throw new DomainValidationException(failures);
        }

        return await next();
    }
}