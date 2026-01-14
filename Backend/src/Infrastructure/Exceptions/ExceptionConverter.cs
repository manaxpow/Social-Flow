using Microsoft.AspNetCore.Mvc;
using SocialFlow.Domain.Exceptions;

public class ExceptionConverter : IExceptionToProblemDetailsConverter
{
    public ProblemDetails Convert(Exception exception, string traceId)
    {
        var problem = new ProblemDetails
        {
            Extensions =
            {
                ["traceId"] = traceId
            },
        };

        switch (exception)
        {
            case ValidationException valEx:
                problem.Status = 400;
                problem.Title = "Validation Error";
                problem.Detail = valEx.Message;
                problem.Extensions["errors"] = valEx.Errors;
                break;

            case AppException domainException:
                problem.Status = domainException.StatusCode;
                problem.Title = "Application Error";
                problem.Detail = domainException.Message;
                break;


            default:
                problem.Status = 500;
                problem.Title = "Server Error";
                problem.Detail = "An internal error occurred.";
                break;
        }
        return problem;
    }
}