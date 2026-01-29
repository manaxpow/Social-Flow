using FluentValidation;

public class GetPostsByUserIdValidator : AbstractValidator<GetPostsByUserIdQuery>
{
    public GetPostsByUserIdValidator()
    {
        RuleFor(x => x.UserId).NotEmpty();
        RuleFor(x => x.PageNumber).GreaterThanOrEqualTo(1);
        RuleFor(x => x.PageSize).GreaterThanOrEqualTo(1);
    }
}