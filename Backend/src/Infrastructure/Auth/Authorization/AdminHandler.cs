using Microsoft.AspNetCore.Authorization;

public class AdminHandler : AuthorizationHandler<IsOwnerRequirement, IOwnable>
{
    protected override Task HandleRequirementAsync(AuthorizationHandlerContext context, IsOwnerRequirement requirement, IOwnable resource)
    {
        var isAdminClaim = context.User.Claims.FirstOrDefault(c => c.Type == "isAdmin")?.Value;

        if (isAdminClaim != null && bool.TryParse(isAdminClaim, out bool isAdmin) && isAdmin)
        {
            context.Succeed(requirement);
        }
        return Task.CompletedTask;
    }
}