import * as z from "zod";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

export const createPostSchema = z
  .object({
    content: z.string().max(5000, "Nội dung không được quá 5000 ký tự"),
    image: z
      .any()
      .refine(
        (file) => !file || file.size <= MAX_FILE_SIZE,
        "Kích thước ảnh tối đa là 5MB",
      )
      .refine(
        (file) => !file || ACCEPTED_IMAGE_TYPES.includes(file.type),
        "Chỉ hỗ trợ định dạng .jpg, .jpeg, .png và .webp",
      )
      .optional(),
  })
  .refine((data) => data.content.trim().length > 0 || data.image, {
    message: "Bài viết phải có nội dung hoặc ảnh",
    path: ["content"],
  });

export type CreatePostValues = z.infer<typeof createPostSchema>;
