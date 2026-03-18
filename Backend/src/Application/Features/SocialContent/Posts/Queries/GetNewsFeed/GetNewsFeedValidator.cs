using System.Data;
using FluentValidation;

public class GetNewsFeedValidator : AbstractValidator<GetNewsFeedQuery>
{
    public GetNewsFeedValidator()
    {
        RuleFor(x => x.UserId).NotEmpty();
        RuleFor(x => x.PageNumber).GreaterThanOrEqualTo(1);
        RuleFor(x => x.PageSize).GreaterThanOrEqualTo(1);
    }
}