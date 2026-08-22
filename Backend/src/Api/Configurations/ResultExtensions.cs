public static class ResultExtensions
{
    public static int GetStatusCode<T>(this Result<T> result)
    {
        if (result.IsSuccess) return 200;

        return result.Error.Code switch
        {
            // Unauthorized (401)
            "Auth.InvalidCredentials" or "Auth.TokenExpired" or "Auth.Unauthorized" => StatusCodes.Status401Unauthorized,

            // Forbidden (403)
            "Auth.Forbidden" => StatusCodes.Status403Forbidden,

            // Not Found (404)
            var code when code.EndsWith(".NotFound") => StatusCodes.Status404NotFound,

            // Conflict (409)
            var code when code.EndsWith(".AlreadyExists") || code.Contains("Conflict") => StatusCodes.Status409Conflict,

            // Mặc định là 400 Bad Request
            _ => StatusCodes.Status400BadRequest
        };
    }
}