using MediatR;

public class UpdateAvatarHandler : IRequestHandler<UpdateAvatarCommand, Result<Unit>>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMediaService _mediaService;
    private readonly ICurrentUserService _currentUserService;

    public UpdateAvatarHandler(IUnitOfWork unitOfWork, IMediaService mediaService, ICurrentUserService currentUserService)
    {
        _unitOfWork = unitOfWork;
        _mediaService = mediaService;
        _currentUserService = currentUserService;
    }

    public async Task<Result<Unit>> Handle(UpdateAvatarCommand request, CancellationToken cancellationToken)
    {
        var userId = _currentUserService.UserId;
        if (userId == null) return Result<Unit>.Failure(AuthErrors.Unauthorized);

        var user = await _unitOfWork.Users.GetByIdAsync(userId.Value);
        if (user == null) return Result<Unit>.Failure(AuthErrors.Unauthorized);

        // Tải ảnh mới lên
        var uploadResult = await _mediaService.UploadImageAsync(request.Avatar, "avatar");
        if (uploadResult == null || !uploadResult.IsSuccess) return Result<Unit>.Failure(UserErrors.UploadFailed);

        // Cập nhật URL ảnh đại diện mới
        user.UpdateAvatar(new CloudImage(uploadResult.Url, uploadResult.PublicId));

        // Lưu thay đổi vào database
        await _unitOfWork.SaveChangesAsync();

        return Result<Unit>.Success(Unit.Value);
    }
}