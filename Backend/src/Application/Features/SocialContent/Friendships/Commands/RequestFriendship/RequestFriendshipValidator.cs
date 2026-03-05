using FluentValidation;

public class RequestFriendshipValidator : AbstractValidator<RequestFriendshipCommand>
{
    public RequestFriendshipValidator()
    {
        RuleFor(v => v.FriendId).NotEmpty();
    }
}