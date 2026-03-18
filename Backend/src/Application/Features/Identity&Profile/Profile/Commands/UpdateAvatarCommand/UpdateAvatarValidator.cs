using FluentValidation;
using Microsoft.AspNetCore.Http;

public class FileValidator : AbstractValidator<IFormFile>
{
    private const long MaxFileSize = 5 * 1024 * 1024; // 5MB
    private readonly string[] _allowedExtensions = { ".jpg", ".jpeg", ".png", ".webp" };

    public FileValidator()
    {
        RuleFor(x => x.Length)
            .NotNull()
            .LessThanOrEqualTo(MaxFileSize)
            .WithMessage("Dung lượng mỗi ảnh không được vượt quá 5MB.");

        RuleFor(x => x.FileName)
            .Must(fileName => !string.IsNullOrEmpty(fileName) &&
                  _allowedExtensions.Contains(Path.GetExtension(fileName).ToLower()))
            .WithMessage($"Chỉ hỗ trợ các định dạng ảnh: {string.Join(", ", _allowedExtensions)}");
    }
}

public class UpdateAvatarValidator : AbstractValidator<UpdateAvatarCommand>
{
    public UpdateAvatarValidator()
    {
        RuleFor(x => x.Avatar)
            .NotNull().WithMessage("Vui lòng chọn ảnh đại diện.")
            .SetValidator(new FileValidator());
    }
}

