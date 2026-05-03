using AutoMapper;
using MediatR;

public class GetFriendsHandler : IRequestHandler<GetFriendsQuery, Result<List<UserResponse>>>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;
    private readonly ICurrentUserService _currentUserService;

    public GetFriendsHandler(IUnitOfWork unitOfWork, IMapper mapper, ICurrentUserService currentUserService)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
        _currentUserService = currentUserService;
    }

    public async Task<Result<List<UserResponse>>> Handle(GetFriendsQuery request, CancellationToken cancellationToken)
    {
        var currentUserId = _currentUserService.UserId;
        if (currentUserId is null) return Result<List<UserResponse>>.Failure(AuthErrors.Unauthorized);

        var friendIds = await _unitOfWork.Friendships.GetFriendsAsync(currentUserId.Value, cancellationToken);

        if (friendIds.Count == 0)
            return Result<List<UserResponse>>.Success(new List<UserResponse>());

        // Fetch users one by one since GetByIdsAsync doesn't exist
        var users = new List<User>();
        foreach (var friendId in friendIds)
        {
            var user = await _unitOfWork.Users.GetByIdAsync(friendId, cancellationToken);
            if (user != null)
            {
                users.Add(user);
            }
        }

        if (string.IsNullOrWhiteSpace(request.Search))
        {
            var mappedUsers = _mapper.Map<List<UserResponse>>(users);
            return Result<List<UserResponse>>.Success(mappedUsers);
        }

        var filteredUsers = users
            .Where(u => $"{u.FirstName} {u.LastName}".Contains(request.Search, StringComparison.OrdinalIgnoreCase))
            .ToList();

        var mappedFilteredUsers = _mapper.Map<List<UserResponse>>(filteredUsers);
        return Result<List<UserResponse>>.Success(mappedFilteredUsers);
    }
}
