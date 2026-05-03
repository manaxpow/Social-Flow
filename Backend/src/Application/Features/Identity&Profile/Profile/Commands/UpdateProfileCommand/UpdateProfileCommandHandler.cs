using AutoMapper;
using MediatR;

public class UpdateProfileCommandHandler : IRequestHandler<UpdateProfileCommand, Result<UserResponse>>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICurrentUserService _currentUserService;
    private readonly IMapper _mapper;

    public UpdateProfileCommandHandler(IUnitOfWork unitOfWork, ICurrentUserService currentUserService, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _currentUserService = currentUserService;
        _mapper = mapper;
    }

    public async Task<Result<UserResponse>> Handle(UpdateProfileCommand request, CancellationToken cancellationToken)
    {
        var userId = _currentUserService.UserId;
        if (userId == null)
            return Result<UserResponse>.Failure(AuthErrors.Unauthorized);
        var user = await _unitOfWork.Users.GetByIdAsync(userId.Value, cancellationToken);
        if (user == null)
            return Result<UserResponse>.Failure(UserErrors.NotFound);

        user.UpdateProfile(
            firstName: request.FirstName,
            lastName: request.LastName,
            dateOfBirth: request.DateOfBirth,
            bio: request.Bio,
            gender: request.Gender);

        _unitOfWork.Users.Update(user);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var response = _mapper.Map<UserResponse>(user);
        return Result<UserResponse>.Success(response);
    }
}