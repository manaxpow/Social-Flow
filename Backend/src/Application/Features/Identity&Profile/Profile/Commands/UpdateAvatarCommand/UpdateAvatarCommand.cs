using MediatR;
using Microsoft.AspNetCore.Http;

public record UpdateAvatarCommand(
    string AvatarUrl,
    MediaType MediaType,
    string PublicId
) : IRequest<Result<Unit>>;