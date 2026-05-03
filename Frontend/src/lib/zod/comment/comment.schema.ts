import * as z from "zod";

export const createCommentSchema = z
  .object({
    content: z.string().max(2000, "Nội dung bình luận không được quá 2000 ký tự"),
  })
  .refine((data) => data.content.trim().length > 0, {
    message: "Bình luận phải có nội dung",
    path: ["content"],
  });

export type CreateCommentValues = z.infer<typeof createCommentSchema>;