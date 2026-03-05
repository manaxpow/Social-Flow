using MediatR;
using Microsoft.AspNetCore.Http;

public record UpdateAvatarCommand(IFormFile Avatar) : IRequest<Result<Unit>>;