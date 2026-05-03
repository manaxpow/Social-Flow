using AutoMapper;
using MediatR;

namespace SocialFlow.Application.Features.IdentityProfile.Profile.Queries.GetUserById;

public class GetUserByIdHandler : IRequestHandler<GetUserByIdQuery, Result<UserResponse>>
{
    private readonly IUserQuries _userManager;
    private readonly IMapper _mapper;
    private readonly IFriendshipRepository _friendshipRepository;

    public GetUserByIdHandler(IMapper mapper, IUserQuries userManager, IFriendshipRepository friendshipRepository)
    {
        _mapper = mapper;
        _userManager = userManager;
        _friendshipRepository = friendshipRepository;
    }

    public async Task<Result<UserResponse>> Handle(GetUserByIdQuery request, CancellationToken cancellationToken)
    {
        var user = await _userManager.GetMe(request.UserId, cancellationToken);
        if (user == null) return Result<UserResponse>.Failure(UserErrors.NotFound);

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
