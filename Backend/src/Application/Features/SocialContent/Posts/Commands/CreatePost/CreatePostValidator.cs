using FluentValidation;

public class CreatePostValidator : AbstractValidator<CreatePostCommand>
{
    private const int MaxImageCount = 4;

    public CreatePostValidator()
    {
        RuleFor(x => x)
            .Must(x => !string.IsNullOrWhiteSpace(x.Content) ||
                       (x.Files != null && x.Files.Any()) ||
                       x.SharedPostId.HasValue)
            .WithMessage("Một bài viết phải có nội dung, ảnh hoặc là bài chia sẻ.");

        RuleFor(x => x.Content)
            .MaximumLength(2000);

        RuleFor(x => x.Files)
            .Must(files => files == null || files.Count <= MaxImageCount)
            .WithMessage($"Bạn chỉ có thể đăng tối đa {MaxImageCount} ảnh.");

        RuleForEach(x => x.Files)
            .SetValidator(new FileValidator());

        RuleFor(x => x.MentionedUserIds)
            .Must(ids => ids == null || ids.Distinct().Count() == ids.Count)
            .WithMessage("Danh sách nhắc tên không được có ID trùng lặp.");
    }
}