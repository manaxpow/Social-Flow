using MediatR;

public class UpdateCoverHandler : IRequestHandler<UpdateCoverCommand, Result<Unit>>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMediaService _mediaService;
    private readonly ICurrentUserService _currentUserService;

    public UpdateCoverHandler(IUnitOfWork unitOfWork, IMediaService mediaService, ICurrentUserService currentUserService)
    {
        _unitOfWork = unitOfWork;
        _mediaService = mediaService;
        _currentUserService = currentUserService;
    }

    public async Task<Result<Unit>> Handle(UpdateCoverCommand request, CancellationToken cancellationToken)
    {
        var userId = _currentUserService.UserId;
        if (userId == null) return Result<Unit>.Failure(AuthErrors.Unauthorized);

        var user = await _unitOfWork.Users.GetByIdAsync(userId.Value);
        if (user == null) return Result<Unit>.Failure(AuthErrors.Unauthorized);

        // Cập nhật URL ảnh bìa mới
        user.UpdateCover(new CloudAsset(request.CoverUrl, request.PublicId, MediaType.Image));

        // Lưu thay đổi vào database
        await _unitOfWork.SaveChangesAsync();

        return Result<Unit>.Success(Unit.Value);
    }
}