using System.Security.Claims;
using Microsoft.AspNetCore.Http;

public class CurrentUserService : ICurrentUserService
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public CurrentUserService(IHttpContextAccessor httpContextAccessor) => _httpContextAccessor = httpContextAccessor;
    public Guid? UserId => Guid.Parse(_httpContextAccessor.HttpContext!.User.FindFirstValue(ClaimTypes.NameIdentifier)!);
    public bool IsAuthenticated => _httpContextAccessor.HttpContext!.User.Identity!.IsAuthenticated;

    public IEnumerable<string> Roles =>
        User?.FindAll(ClaimTypes.Role).Select(x => x.Value) ?? Enumerable.Empty<string>();

    public ClaimsPrincipal? User => _httpContextAccessor.HttpContext?.User;

    public bool IsInRole(string role)
    {
        return Roles.Contains(role);
    }
}