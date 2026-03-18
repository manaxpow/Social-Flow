using Microsoft.AspNetCore.Http;

public static class CookiesHelper
{
    public static void AppendCookie(HttpResponse response, string key, string value, int? expireTime)
    {
        CookieOptions option = new CookieOptions
        {
            HttpOnly = true,
            Secure = false,
            SameSite = SameSiteMode.Strict,
        };

        if (expireTime.HasValue)
            option.Expires = DateTime.UtcNow.AddMinutes(expireTime.Value);
        else
            option.Expires = DateTime.UtcNow.AddMilliseconds(10);

        response.Cookies.Append(key, value, option);
    }

    public static string? GetCookie(HttpRequest request, string key)
    {
        return request.Cookies[key];
    }

    public static void DeleteCookie(HttpResponse response, string key)
    {
        response.Cookies.Delete(key);
    }
}