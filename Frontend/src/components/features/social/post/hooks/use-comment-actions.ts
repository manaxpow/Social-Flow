import { useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { commentService } from "@/services/comment/comment.service";
import type { ReplyItem, CommentWithReplies } from "./use-comments";

interface UseCommentActionsOptions {
  postId: string;
  currentUser: { id: string; fullName?: string; avatarUrl?: string | null } | null;
  replyingTo: string | null;
  setReplyingTo: (id: string | null) => void;
  setReplyText: (text: string) => void;
  setCommentText: (text: string) => void;
  setComments: React.Dispatch<React.SetStateAction<CommentWithReplies[]>>;
}

interface UseCommentActionsReturn {
  createComment: (content: string, parentCommentId?: string | null) => void;
  replyingTo: string | null;
  replyText: string;
  setReplyText: (text: string) => void;
  isPending: boolean;
}

export const useCommentActions = ({
  postId,
  currentUser,
  replyingTo,
  setReplyingTo,
  setReplyText,
  setCommentText,
  setComments,
}: UseCommentActionsOptions): UseCommentActionsReturn => {
  const queryClient = useQueryClient();

  const createCommentMutation = useMutation({
    mutationFn: (params: { content: string; parentCommentId?: string | null }) =>
      commentService.createComment({
        postId,
        content: params.content,
        parentCommentId: params.parentCommentId ?? null,
      }),
    onSuccess: (result) => {
      console.log("[CreateComment] onSuccess result:", result);

      if (result.isSuccess && result.data) {
        const newReply: ReplyItem = {
          id: result.data.id,
          content: result.data.content || "",
          reactionsCount: result.data.reactionsCount || 0,
          replyCount: 0,
          author: {
            id: result.data.author?.id || result.data.authorId || currentUser?.id || "",
            fullName: result.data.author?.fullName || currentUser?.fullName || "Unknown",
            avatarUrl: result.data.author?.avatarUrl || currentUser?.avatarUrl || null,
          },
          createdAt: result.data.createdAt || new Date().toISOString(),
          showReplies: false,
          nestedReplies: [],
          nestedRepliesPage: 0,
          hasMoreNestedReplies: false,
        };

        if (replyingTo) {
          setReplyText("");
          setReplyingTo(null);

          // Add the new reply to the correct location (level 1 or level 2)
          setComments((prev) => {
            for (const comment of prev) {
              if (comment.replies) {
                for (const reply of comment.replies) {
                  if (reply.nestedReplies?.some((nr) => nr.id === replyingTo)) {
                    return prev.map((c) => {
                      if (c.id === comment.id && c.replies) {
                        return {
                          ...c,
                          replies: c.replies.map((r) => {
                            if (r.id === reply.id) {
                              return {
                                ...r,
                                nestedReplies: [...(r.nestedReplies || []), newReply],
                                replyCount: (r.replyCount ?? 0) + 1,
                                showReplies: true,
                              };
                            }
                            return r;
                          }),
                        };
                      }
                      return c;
                    });
                  }
                }
                if (comment.replies.some((r) => r.id === replyingTo)) {
                  return prev.map((c) => {
                    if (c.id === comment.id && c.replies) {
                      return {
                        ...c,
                        replies: c.replies.map((r) => {
                          if (r.id === replyingTo) {
                            return {
                              ...r,
                              nestedReplies: [...(r.nestedReplies || []), newReply],
                              replyCount: (r.replyCount ?? 0) + 1,
                              showReplies: true,
                            };
                          }
                          return r;
                        }),
                      };
                    }
                    return c;
                  });
                }
              }
            }
            return prev;
          });

          queryClient.invalidateQueries({ queryKey: ["comment-replies", replyingTo] });
        } else {
          setCommentText("");
          console.log("[CreateComment] New comment data:", result.data);

          const newComment: CommentWithReplies = {
            id: result.data.id,
            content: result.data.content || "",
            reactionCount: result.data.reactionsCount || 0,
            authorId: result.data.author?.id || result.data.authorId || currentUser?.id || "",
            authorName: result.data.author?.fullName || currentUser?.fullName || "Unknown",
            authorAvatarUrl: result.data.author?.avatarUrl || currentUser?.avatarUrl || null,
            createdAt: result.data.createdAt || new Date().toISOString(),
          };
          console.log("[CreateComment] Adding new comment:", newComment);
          setComments((prev) => [newComment, ...prev]);
        }
        queryClient.invalidateQueries({ queryKey: ["posts"] });
        queryClient.invalidateQueries({ queryKey: ["post", postId] });
        queryClient.invalidateQueries({ queryKey: ["post-comments", postId] });
        toast.success(replyingTo ? "Đã gửi phản hồi" : "Đã gửi bình luận");
      } else {
        console.error(
          "[CreateComment] onSuccess called but result.isSuccess is false or result.data is null:",
          result
        );
        const errors = result.error?.errors as string[] | undefined;
        if (errors && errors.length > 0) {
          toast.error(errors[0]);
        } else {
          toast.error(result.error?.detail || "Không thể gửi bình luận. Vui lòng thử lại.");
        }
      }
    },
    onError: (error) => {
      console.error("[CreateComment] onError:", error);
      const errors = (error as any)?.error?.errors as string[] | undefined;
      if (errors && errors.length > 0) {
        toast.error(errors[0]);
      } else {
        toast.error("Không thể gửi bình luận. Vui lòng thử lại.");
      }
    },
  });

  const createComment = useCallback(
    (content: string, parentCommentId?: string | null) => {
      const trimmed = content.trim();
      if (!trimmed || createCommentMutation.isPending) return;
      createCommentMutation.mutate({ content: trimmed, parentCommentId });
    },
    [createCommentMutation]
  );

  return {
    createComment,
    replyingTo,
    replyText: "",
    setReplyText,
    isPending: createCommentMutation.isPending,
  };
};
