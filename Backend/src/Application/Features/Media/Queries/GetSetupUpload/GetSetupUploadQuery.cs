using MediatR;

public record GetSetupUploadQuery(string Folder) : IRequest<Result<SetupUploadResponse>>;