
using MediatR;
using Microsoft.AspNetCore.Http;

public record UpdatePostCommand(
    Guid Id,
    string? Content,
    string? MediaUrl,
    List<IFormFile>? Files,
    List<Guid>? MentionedUserIds
) : IRequest<Result<PostResponse>>;