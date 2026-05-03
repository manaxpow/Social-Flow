using System.Security.Claims;

public interface ICurrentUserService
{
    Guid? UserId { get; }
    bool IsAuthenticated { get; }

    // Thêm các tiện ích cho Authorization
    bool IsInRole(string role);
    IEnumerable<string> Roles { get; }

    // ClaimsPrincipal để dùng cho Resource-based Authorization (AuthorizeAsync)
    ClaimsPrincipal? User { get; }
}