using AutoMapper;
using MediatR;

public class LoginHandler : IRequestHandler<LoginCommand, Result<LoginResponse>>
{
    private readonly IIdentityService _identityService;
    private readonly IUserRepository _userRepository;
    private readonly IJwtTokenGenerator _jwtTokenGenerator;
    private readonly IMapper _mapper;
    private readonly IUnitOfWork _unitOfWork;
    public LoginHandler(IIdentityService identityService, IUserRepository userRepository, IJwtTokenGenerator jwtTokenGenerator, IUnitOfWork unitOfWork, IMapper mapper)
    {
        _identityService = identityService;
        _userRepository = userRepository;
        _jwtTokenGenerator = jwtTokenGenerator;
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<Result<LoginResponse>> Handle(LoginCommand request, CancellationToken cancellationToken)
    {
        var result = await _identityService.AuthenticateAsync(request.Email, request.Password);

        if (result.IsFailure)
        {
            return Result<LoginResponse>.Failure(result.Error, result.Metadata);
        }

        var accessToken = _jwtTokenGenerator.GenerateToken(result.Value!);
        var refreshToken = _identityService.GenerateRefreshToken();

        await _userRepository.UpdateRefreshTokenAsync(result.Value!.Id, refreshToken, DateTime.UtcNow.AddDays(7));
        await _unitOfWork.SaveChangesAsync();

        var user = _mapper.Map<UserResponse>(result.Value);
        return Result<LoginResponse>.Success(new LoginResponse
        {
            AccessToken = accessToken,
            RefreshToken = refreshToken,
            User = user
        });
    }
}