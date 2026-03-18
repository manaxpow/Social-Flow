using FluentValidation;

public class CancelFriendshipValidator : AbstractValidator<CancelFriendshipCommand>
{
    public CancelFriendshipValidator()
    {
        RuleFor(v => v.FriendId).NotEmpty();
    }
}