using FluentValidation;

public class UpdateProfileCommandValidator : AbstractValidator<UpdateProfileCommand>
{
    public UpdateProfileCommandValidator()
    {
        RuleFor(x => x.FirstName)
            .NotEmpty().WithMessage("Họ không được để trống.")
            .MaximumLength(50);

        RuleFor(x => x.LastName)
            .NotEmpty().WithMessage("Tên không được để trống.")
            .MaximumLength(50);
        RuleFor(x => x.Gender)
              .NotNull().WithMessage("Vui lòng chọn giới tính.")
              .IsInEnum();
        // 2. Các trường TÙY CHỌN (Chỉ validate nếu có dữ liệu)
        RuleFor(x => x.DateOfBirth)
            .Must(BeAValidAge).WithMessage("Bạn phải trên 13 tuổi.")
            .When(x => x.DateOfBirth.HasValue);

        RuleFor(x => x.Bio)
            .MaximumLength(500).WithMessage("Tiểu sử tối đa 500 ký tự.");
    }

    private bool BeAValidAge(DateTime? date) =>
    date <= DateTime.Now.AddYears(-13);
}