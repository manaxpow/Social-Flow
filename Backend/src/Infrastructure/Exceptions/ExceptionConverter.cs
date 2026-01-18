using System.Text.Json;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using SocialFlow.Domain.Exceptions;

public class ExceptionConverter : IExceptionToProblemDetailsConverter
{
    public ProblemDetails Convert(Exception exception, string traceId)
    {
        var problem = new ProblemDetails
        {
            Instance = traceId
        };

        switch (exception)
        {
            case ValidationException valEx:
                problem.Status = StatusCodes.Status400BadRequest;
                problem.Title = "One or more validation errors occurred.";
                problem.Detail = valEx.Message;

                problem.Extensions["errors"] = valEx.Errors;
                problem.Extensions["errorCode"] = "Validation.Error";
                break;

            case AppException domainException:
                problem.Status = domainException.StatusCode;
                problem.Title = "Application Error";
                problem.Detail = domainException.Message;

                if (domainException.Metadata != null)
                {
                    var properties = domainException.Metadata.GetType().GetProperties();
                    foreach (var prop in properties)
                    {
                        var key = JsonNamingPolicy.CamelCase.ConvertName(prop.Name);
                        problem.Extensions[key] = prop.GetValue(domainException.Metadata);
                    }
                }
                break;


            default:
                problem.Status = StatusCodes.Status500InternalServerError;
                problem.Title = "An unexpected error occurred.";
                problem.Detail = "Please contact support with the provided Trace ID.";
                break;
        }
        return problem;
    }
}