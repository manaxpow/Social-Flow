using MediatR;
using Microsoft.AspNetCore.Http;

public record UpdateCoverCommand(
    string CoverUrl,
    MediaType MediaType,
    string PublicId
) : IRequest<Result<Unit>>;