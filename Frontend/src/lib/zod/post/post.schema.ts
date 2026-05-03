import * as z from "zod";

export const MAX_MEDIA_COUNT = 5;

export const createPostSchema = z
  .object({
    content: z.string().max(10000, "Nội dung không được quá 10000 ký tự"),
  })
  .refine((data) => data.content.trim().length > 0, {
    message: "Bài viết phải có nội dung",
    path: ["content"],
  });

export type CreatePostValues = z.infer<typeof createPostSchema>;