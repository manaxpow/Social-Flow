using FluentValidation;

public class AcceptFriendshipValidator : AbstractValidator<AcceptFriendshipCommand>
{
    public AcceptFriendshipValidator()
    {
        RuleFor(v => v.FriendId).NotEmpty();
    }
}