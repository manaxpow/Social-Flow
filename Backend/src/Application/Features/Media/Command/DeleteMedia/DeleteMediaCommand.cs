using MediatR;

public record DeleteMediaCommand(string PublicId, MediaType MediaType = MediaType.Image) : IRequest<Result<Unit>>;