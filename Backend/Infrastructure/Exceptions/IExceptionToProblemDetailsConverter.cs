using Microsoft.AspNetCore.Mvc;

public interface IExceptionToProblemDetailsConverter
{
    ProblemDetails Convert(Exception exception, string traceId);
}