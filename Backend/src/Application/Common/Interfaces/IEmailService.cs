public interface IEmailService
{
    Task SendEmailAsync(string to, string subject, string body);

    Task SendLockoutEmailAsync(string email, string name, string traceId);

    Task SendPasswordResetEmailAsync(string email, string linkResetToken);
}