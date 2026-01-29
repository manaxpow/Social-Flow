using MediatR;

public class RefreshTokenHandler : IRequestHandler<RefreshTokenCommand, Result<LoginResponse>>
{
    private readonly IUserRepository _userRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IJwtTokenGenerator _jwtTokenGenerator;
    private readonly IIdentityService _identityService;

    public RefreshTokenHandler(IUserRepository userRepository, IUnitOfWork unitOfWork, IJwtTokenGenerator jwtTokenGenerator, IIdentityService identityService)
    {
        _userRepository = userRepository;
        _unitOfWork = unitOfWork;
        _jwtTokenGenerator = jwtTokenGenerator;
        _identityService = identityService;
    }

    public async Task<Result<LoginResponse>> Handle(RefreshTokenCommand request, CancellationToken cancellationToken)
    {
        var result = await _userRepository.GetByRefreshTokenAsync(request.RefreshToken);

        if (result is null)
        {
            return Result<LoginResponse>.Failure(AuthErrors.InvalidToken);
        }

        if (result.RefreshTokenExpiryTime < DateTime.UtcNow)
        {
            return Result<LoginResponse>.Failure(AuthErrors.TokenExpired);
        }

        var accessToken = _jwtTokenGenerator.GenerateToken(result);
        var newRefreshToken = _identityService.GenerateRefreshToken();

        await _userRepository.UpdateRefreshTokenAsync(result.Id, newRefreshToken, DateTime.UtcNow.AddDays(7));
        await _unitOfWork.SaveChangesAsync();

        return Result<LoginResponse>.Success(new LoginResponse
        {
            Id = result.Id,
            AccessToken = accessToken,
            RefreshToken = newRefreshToken
        });
    }
}