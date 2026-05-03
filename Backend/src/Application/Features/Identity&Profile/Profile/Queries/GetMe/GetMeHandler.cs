using AutoMapper;
using MediatR;
using Microsoft.AspNetCore.Identity;

namespace Shop.Application.Features.Placeholder.Commands.GetMe;

public class GetMeHandler : IRequestHandler<GetMeQuery, Result<UserResponse>>
{
    private readonly IUserQuries _userManager;
    private readonly ICurrentUserService _currentUserService;
    private readonly IMapper _mapper;
    private readonly IFriendshipRepository _friendshipRepository;

    public GetMeHandler(IMapper mapper, IUserQuries userManager, ICurrentUserService currentUserService, IFriendshipRepository friendshipRepository)
    {
        _mapper = mapper;
        _currentUserService = currentUserService;
        _userManager = userManager;
        _friendshipRepository = friendshipRepository;
    }

    public async Task<Result<UserResponse>> Handle(GetMeQuery request, CancellationToken cancellationToken)
    {
        var currentUser = _currentUserService.UserId;
        if (currentUser == null) return Result<UserResponse>.Failure(AuthErrors.Unauthorized);

        var user = await _userManager.GetMe(currentUser.Value, cancellationToken);
        if (user == null) return Result<UserResponse>.Failure(AuthErrors.Unauthorized);

        var response = _mapper.Map<UserResponse>(user);

        // Populate additional fields
        var followersCount = await _friendshipRepository.GetFollowersCountAsync(user.Id, cancellationToken);
        var followingCount = await _friendshipRepository.GetFollowingCountAsync(user.Id, cancellationToken);

        // Create a new UserResponse with all populated fields
        response = response with
        {
            FollowersCount = followersCount,
            FollowingCount = followingCount
        };

        return Result<UserResponse>.Success(response);
    }
}
