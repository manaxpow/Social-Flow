using MimeKit;
using MimeKit.Text;
using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Options;

public class EmailService(IOptions<EmailSettings> options) : IEmailService
{
    public async Task SendEmailAsync(string to, string subject, string body)
    {
        var email = new MimeMessage();
        email.From.Add(MailboxAddress.Parse(options.Value.From));
        email.To.Add(MailboxAddress.Parse(to));
        email.Subject = subject;
        email.Body = new TextPart(TextFormat.Html) { Text = body };

        using var smtp = new SmtpClient();
        try
        {
            await smtp.ConnectAsync(options.Value.Host, options.Value.Port, SecureSocketOptions.StartTls);
            await smtp.AuthenticateAsync(options.Value.Username, options.Value.Password);
            await smtp.SendAsync(email);
        }
        finally
        {
            await smtp.DisconnectAsync(true);
        }
    }

    public async Task SendEmailConfirmationEmailAsync(string name, string email, string linkConfirmationToken)
    {
        var assembly = typeof(EmailService).Assembly;
        var resourceName = "Infrastructure.Templates.ConfirmEmail.html";
        using var stream = assembly.GetManifestResourceStream(resourceName);
        if (stream == null)
        {
            var names = assembly.GetManifestResourceNames();
            throw new Exception($"Không tìm thấy template. Các resource hiện có: {string.Join(", ", names)}");
        }

        using var reader = new StreamReader(stream);
        var template = await reader.ReadToEndAsync();

        var body = template
            .Replace("{{ConfirmationLink}}", linkConfirmationToken)
            .Replace("{{UserName}}", name);
        await SendEmailAsync(email, "Yêu cầu đặt lại mật khẩu", body);
    }

    public async Task SendLockoutEmailAsync(string email, string name, string traceId)
    {
        var assembly = typeof(EmailService).Assembly;
        var resourceName = "Infrastructure.Templates.LockoutEmail.html";
        using var stream = assembly.GetManifestResourceStream(resourceName);
        if (stream == null)
        {
            var names = assembly.GetManifestResourceNames();
            throw new Exception($"Không tìm thấy template. Các resource hiện có: {string.Join(", ", names)}");
        }

        using var reader = new StreamReader(stream);
        var template = await reader.ReadToEndAsync();

        var body = template
            .Replace("{{Name}}", name)
            .Replace("{{TraceId}}", traceId)
            .Replace("{{ResetLink}}", "https://socialflow.com/forgot-password");

        await SendEmailAsync(email, "Cảnh báo bảo mật: Tài khoản bị khóa tạm thời", body);
    }

    public async Task SendPasswordResetEmailAsync(string email, string linkResetToken)
    {
        var assembly = typeof(EmailService).Assembly;
        var resourceName = "Infrastructure.Templates.ForgotPassword.html";
        using var stream = assembly.GetManifestResourceStream(resourceName);
        if (stream == null)
        {
            var names = assembly.GetManifestResourceNames();
            throw new Exception($"Không tìm thấy template. Các resource hiện có: {string.Join(", ", names)}");
        }

        using var reader = new StreamReader(stream);
        var template = await reader.ReadToEndAsync();

        var body = template
            .Replace("{{ResetLink}}", linkResetToken);
        await SendEmailAsync(email, "Yêu cầu đặt lại mật khẩu", body);
    }
}