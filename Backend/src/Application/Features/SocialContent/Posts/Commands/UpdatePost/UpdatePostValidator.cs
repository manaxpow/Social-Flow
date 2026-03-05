using FluentValidation;

public class UpdatePostValidator : AbstractValidator<UpdatePostCommand>
{
    private const int MaxImageCount = 4;

    public UpdatePostValidator()
    {
        RuleFor(x => x.Id).NotEmpty().WithMessage("ID bài viết không được để trống.");

        // 1. Ràng buộc tổng thể: Sau khi update, bài viết vẫn phải có "ruột"
        RuleFor(x => x)
            .Must(x => !string.IsNullOrWhiteSpace(x.Content) ||
                       (x.Files != null && x.Files.Any()) ||
                       !string.IsNullOrWhiteSpace(x.MediaUrl)) // MediaUrl ở đây có thể là ảnh cũ còn giữ lại
            .WithMessage("Bài viết phải có nội dung hoặc hình ảnh.");

        // 2. Validate nội dung chữ
        RuleFor(x => x.Content)
            .MaximumLength(2000).WithMessage("Nội dung không được vượt quá 2000 ký tự.");

        // 3. Validate danh sách File mới (Sử dụng lại FileValidator đã tách)
        RuleFor(x => x.Files)
            .Must(files => files == null || files.Count <= MaxImageCount)
            .WithMessage($"Tổng số lượng ảnh không được vượt quá {MaxImageCount}.");

        // Tái sử dụng FileValidator cho từng file mới up lên
        RuleForEach(x => x.Files)
            .SetValidator(new FileValidator());

        // 4. Validate Mentions
        RuleFor(x => x.MentionedUserIds)
            .Must(ids => ids == null || ids.Distinct().Count() == (ids?.Count ?? 0))
            .WithMessage("Danh sách nhắc tên không được có ID trùng lặp.");
    }
}