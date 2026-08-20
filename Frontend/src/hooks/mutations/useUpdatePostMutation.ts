import { useMutation, useQueryClient } from "@tanstack/react-query";
import { postService } from "@/services/post/post.service";
import { toast } from "sonner";

export interface UpdatePostParams {
  id: string;
  content: string;
  media?: Array<{ url: string; publicId: string; type: string; sortOrder: number }>;
  mentionedUserIds: string[];
}

/**
 * Mutation hook for updating a post's content, media, and mentions.
 */
export const useUpdatePostMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: UpdatePostParams) => {
      const result = await postService.updatePost({
        id: params.id,
        content: params.content,
        media: params.media,
        mentionedUserIds: params.mentionedUserIds,
      });
      if (!result.isSuccess) {
        throw new Error(String(result.error?.message || "Cập nhật thất bại"));
      }
      return result;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["post", variables.id] });
      toast.success("Bài viết đã được cập nhật.");
    },
    onError: () => {
      toast.error("Không thể cập nhật bài viết. Vui lòng thử lại.");
    },
  });
};
