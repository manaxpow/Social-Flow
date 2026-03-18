using MediatR;

public class RefreshTokenHandler : IRequestHandler<RefreshTokenCommand, Result<RefreshTokenResponse>>
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

    public async Task<Result<RefreshTokenResponse>> Handle(RefreshTokenCommand request, CancellationToken cancellationToken)
    {
        var result = await _userRepository.GetByRefreshTokenAsync(request.RefreshToken);

        if (result is null)
        {
            return Result<RefreshTokenResponse>.Failure(AuthErrors.InvalidToken);
        }

        if (result.RefreshTokenExpiryTime < DateTime.UtcNow)
        {
            return Result<RefreshTokenResponse>.Failure(AuthErrors.TokenExpired);
        }

        var accessToken = _jwtTokenGenerator.GenerateToken(result);
        var newRefreshToken = _identityService.GenerateRefreshToken();

        await _userRepository.UpdateRefreshTokenAsync(result.Id, newRefreshToken, DateTime.UtcNow.AddDays(7));
        await _unitOfWork.SaveChangesAsync();

        return Result<RefreshTokenResponse>.Success(new RefreshTokenResponse
        {
            AccessToken = accessToken,
            RefreshToken = newRefreshToken
        });
    }
}