using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;

public class ResourceOwnerHandler : AuthorizationHandler<IsOwnerRequirement, IOwnable>
{
    protected override Task HandleRequirementAsync(AuthorizationHandlerContext context, IsOwnerRequirement requirement, IOwnable resource)
    {
        var userId = context.User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier)?.Value;

        Console.WriteLine($"User ID from claims: {userId}");
        if (string.IsNullOrEmpty(userId))
        {
            return Task.CompletedTask;
        }

        if (resource.AuthorId.ToString() == userId)
        {
            context.Succeed(requirement);
        }
        return Task.CompletedTask;
    }
}