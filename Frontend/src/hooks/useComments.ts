import { useState, useEffect, useRef, useCallback } from "react";
import api from "@/lib/axios/axios";

export type CommentStatus = 'pending' | 'success' | 'error';

export interface ReplyItem {
  id: string;
  content: string;
  reactionsCount: number;
  author: {
    id: string;
    fullName: string;
    avatarUrl?: string | null;
  };
  createdAt: string;
  replyCount?: number;
  showReplies?: boolean;
  nestedReplies?: ReplyItem[];
  nestedRepliesPage?: number;
  hasMoreNestedReplies?: boolean;
  isEdited?: boolean;
  media?: CommentMedia;
  isParentDeleted?: boolean;
  status?: CommentStatus;
}

export interface CommentMedia {
  url: string;
  publicId: string;
  type: string | number;
}

export interface CommentWithReplies {
  id: string;
  content: string;
  reactionCount: number;
  authorId?: string;
  authorName?: string;
  authorAvatarUrl?: string | null;
  createdAt: string;
  replyCount?: number;
  replies?: ReplyItem[];
  repliesPage?: number;
  hasMoreReplies?: boolean;
  showReplies?: boolean;
  isEdited?: boolean;
  media?: CommentMedia;
  isParentDeleted?: boolean;
  isPending?: boolean;
}

interface UseCommentsOptions {
  postId: string;
  postCommentCount: number;
  open: boolean;
  initialExpandedIds?: Set<string>;
}

interface UseCommentsReturn {
  comments: CommentWithReplies[];
  isLoadingComments: boolean;
  isLoadingMore: boolean;
  hasMoreLv1: boolean;
  expandedCommentIds: Set<string>;
  loadInitialComments: () => Promise<void>;
  loadMoreLv1Comments: () => Promise<void>;
  loadReplies: (commentId: string) => Promise<void>;
  loadNestedReplies: (replyId: string) => Promise<void>;
  toggleReplies: (commentId: string) => void;
  toggleNestedReplies: (replyId: string) => void;
  setComments: React.Dispatch<React.SetStateAction<CommentWithReplies[]>>;
  deleteComment: (commentId: string) => Promise<void>;
  deleteReply: (replyId: string) => Promise<void>;
  editComment: (commentId: string, newContent: string) => Promise<void>;
  editReply: (replyId: string, newContent: string) => Promise<void>;
  incrementCommentCount: () => void;
  decrementCommentCount: () => void;
  incrementReplyCount: (commentId: string) => void;
  decrementReplyCount: (commentId: string) => void;
}

const transformReplies = (replies: any[]): ReplyItem[] => {
  return replies.map((r) => ({
    id: r.id,
    content: r.content,
    reactionsCount: r.reactionsCount,
    replyCount: r.replyCount ?? 0,
    author: {
      id: r.author?.id,
      fullName: r.author?.fullName,
      avatarUrl: r.author?.avatarUrl,
    },
    createdAt: r.createdAt,
    showReplies: false,
    nestedReplies: [],
    nestedRepliesPage: 0,
    hasMoreNestedReplies: (r.replyCount ?? 0) > 0,
    isEdited: r.isEdited ?? false,
    media: r.media ? {
      url: r.media.url,
      publicId: r.media.publicId || "",
      type: r.media.type,
    } : undefined,
    isParentDeleted: r.isParentDeleted ?? false,
  }));
};

const REPLY_PAGE_SIZE = 10;

/**
 * Custom hook for loading, expanding, editing, and deleting comments/replies for a post.
 */
export const useComments = ({
  postId,
  postCommentCount,
  open,
  initialExpandedIds = new Set(),
}: UseCommentsOptions): UseCommentsReturn => {
  const [comments, setComments] = useState<CommentWithReplies[]>([]);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMoreLv1, setHasMoreLv1] = useState(false);
  const [lv1Page, setLv1Page] = useState(1);
  const [expandedCommentIds] = useState<Set<string>>(initialExpandedIds);
  const isCancelledRef = useRef(false);
  const initialLoadDoneRef = useRef(false);

  // Clear comments when modal closes
  useEffect(() => {
    if (!open) {
      isCancelledRef.current = true;
      setComments([]);
      initialLoadDoneRef.current = false;
    } else {
      isCancelledRef.current = false;
    }
  }, [open]);

  // Load initial comments (page 1)
  const loadInitialComments = useCallback(async () => {
    setIsLoadingComments(true);
    try {
      const commentCount = postCommentCount || 0;
      const pageSize = 10;

      const response = await api.get(`/comment/post/${postId}/top-level`, {
        params: { pageNumber: 1, pageSize: pageSize },
      });
      if (isCancelledRef.current) return;

      const data = response.data ?? { items: [], hasNext: false };
      const topLevelComments = data.items || [];

      setHasMoreLv1(data.hasNext ?? false);
      setLv1Page(1);

      if (topLevelComments.length === 0) {
        setComments([]);
        setIsLoadingComments(false);
        initialLoadDoneRef.current = true;
        return;
      }

      if (commentCount <= 10) {
        const commentsWithReplies = await Promise.all(
          topLevelComments.map(async (item: any) => {
            const replies: ReplyItem[] = [];

            if ((item.replyCount ?? 0) > 0) {
              try {
                const repliesResponse = await api.get(`/comment/${item.id}/replies`, {
                  params: { pageNumber: 1, pageSize: 100, postId },
                });
                const repliesData = repliesResponse.data ?? { items: [] };
                const fetchedReplies = transformReplies(repliesData.items || []);

                for (const reply of fetchedReplies) {
                  if ((reply.replyCount ?? 0) > 0) {
                    try {
                      const nestedResponse = await api.get(`/comment/${reply.id}/replies`, {
                        params: { pageNumber: 1, pageSize: 100, postId },
                      });
                      const nestedData = nestedResponse.data ?? { items: [] };
                      reply.nestedReplies = transformReplies(nestedData.items || []).map((nr) => ({
                        ...nr,
                        showReplies: false,
                        nestedReplies: [],
                        nestedRepliesPage: 0,
                        hasMoreNestedReplies: (nr.replyCount ?? 0) > 0,
                      }));
                    } catch (err) {
                      console.error("[LoadNested] Error:", err);
                    }
                  }
                }

                replies.push(...fetchedReplies);
              } catch (err) {
                console.error("[LoadReplies] Error:", err);
              }
            }

            return {
              id: item.id,
              content: item.content || "",
              reactionCount: item.reactionsCount || 0,
              authorId: item.author?.id,
              authorName: item.author?.fullName,
              authorAvatarUrl: item.author?.avatarUrl,
              createdAt: item.createdAt,
              replyCount: item.replyCount || 0,
              replies: replies,
              repliesPage: 1,
              hasMoreReplies: false,
              showReplies: replies.length > 0,
              isEdited: item.isEdited ?? false,
              media: item.media ? {
                url: item.media.url,
                publicId: item.media.publicId || "",
                type: item.media.type,
              } : undefined,
              isParentDeleted: item.isParentDeleted ?? false,
            } as CommentWithReplies;
          })
        );

        if (isCancelledRef.current) return;
        setComments(commentsWithReplies);
      } else {
        if (isCancelledRef.current) return;
        setComments(
          topLevelComments.map((item: any) => ({
            id: item.id,
            content: item.content || "",
            reactionCount: item.reactionsCount || 0,
            authorId: item.author?.id,
            authorName: item.author?.fullName,
            authorAvatarUrl: item.author?.avatarUrl,
            createdAt: item.createdAt,
            replyCount: item.replyCount || 0,
            replies: [],
            repliesPage: 0,
            hasMoreReplies: (item.replyCount ?? 0) > 0,
            showReplies: false,
            isEdited: item.isEdited ?? false,
            media: item.media ? {
              url: item.media.url,
              publicId: item.media.publicId || "",
              type: item.media.type,
            } : undefined,
            isParentDeleted: item.isParentDeleted ?? false,
          })) as CommentWithReplies[]
        );
      }

      initialLoadDoneRef.current = true;
    } catch (err) {
      console.error("[LoadAll] Error:", err);
      if (!isCancelledRef.current) setComments([]);
    } finally {
      setIsLoadingComments(false);
    }
  }, [postId, postCommentCount]);

  const loadMoreLv1Comments = useCallback(async () => {
    if (!hasMoreLv1 || isLoadingMore) return;

    setIsLoadingMore(true);
    try {
      const nextPage = lv1Page + 1;
      const response = await api.get(`/comment/post/${postId}/top-level`, {
        params: { pageNumber: nextPage, pageSize: 10 },
      });
      if (isCancelledRef.current) return;

      const data = response.data ?? { items: [], hasNext: false };
      const newComments = (data.items || []).map((item: any) => ({
        id: item.id,
        content: item.content || "",
        reactionCount: item.reactionsCount || 0,
        authorId: item.author?.id,
        authorName: item.author?.fullName,
        authorAvatarUrl: item.author?.avatarUrl,
        createdAt: item.createdAt,
        replyCount: item.replyCount || 0,
        replies: [],
        repliesPage: 0,
        hasMoreReplies: (item.replyCount ?? 0) > 0,
        showReplies: false,
        isEdited: item.isEdited ?? false,
        media: item.media ? {
          url: item.media.url,
          publicId: item.media.publicId || "",
          type: item.media.type,
        } : undefined,
        isParentDeleted: item.isParentDeleted ?? false,
      })) as CommentWithReplies[];

      setComments((prev) => [...prev, ...newComments]);
      setHasMoreLv1(data.hasNext ?? false);
      setLv1Page(nextPage);
    } catch (err) {
      console.error("[LoadMoreLv1] Error:", err);
    } finally {
      setIsLoadingMore(false);
    }
  }, [hasMoreLv1, isLoadingMore, lv1Page, postId]);

  const loadReplies = useCallback(
    async (commentId: string) => {
      const comment = comments.find((c) => c.id === commentId);
      if (!comment) return;

      const nextPage = (comment.repliesPage ?? 0) + 1;
      const response = await api.get(`/comment/${commentId}/replies`, {
        params: { pageNumber: nextPage, pageSize: REPLY_PAGE_SIZE, postId },
      });
      const data = response.data ?? { items: [], hasNext: false };
      const newReplies = transformReplies(data.items || []);

      setComments((prev) =>
        prev.map((c) => {
          if (c.id === commentId) {
            return {
              ...c,
              replies: [...(c.replies || []), ...newReplies],
              repliesPage: nextPage,
              hasMoreReplies: data.hasNext ?? false,
            };
          }
          return c;
        })
      );
    },
    [comments, postId]
  );

  const loadNestedReplies = useCallback(
    async (replyId: string) => {
      const reply = comments.flatMap((c) => c.replies || []).find((r) => r.id === replyId);
      if (!reply) return;

      const nextPage = (reply.nestedRepliesPage ?? 0) + 1;
      const response = await api.get(`/comment/${replyId}/replies`, {
        params: { pageNumber: nextPage, pageSize: REPLY_PAGE_SIZE, postId },
      });
      const data = response.data ?? { items: [], hasNext: false };
      const newNestedReplies = transformReplies(data.items || []);

      setComments((prev) =>
        prev.map((c) => {
          if (c.replies) {
            const updatedReplies = c.replies.map((r) => {
              if (r.id === replyId) {
                return {
                  ...r,
                  nestedReplies: [...(r.nestedReplies || []), ...newNestedReplies],
                  nestedRepliesPage: nextPage,
                  hasMoreNestedReplies: data.hasNext ?? false,
                };
              }
              return r;
            });
            return { ...c, replies: updatedReplies };
          }
          return c;
        })
      );
    },
    [comments, postId]
  );

  const toggleReplies = useCallback(
    (commentId: string) => {
      const comment = comments.find((c) => c.id === commentId);
      if (!comment) return;

      const willShow = !comment.showReplies;

      setComments((prev) =>
        prev.map((c) => {
          if (c.id === commentId) {
            return { ...c, showReplies: willShow };
          }
          return c;
        })
      );

      if (willShow && (!comment.replies || comment.replies.length === 0)) {
        loadReplies(commentId);
      }
    },
    [comments, loadReplies]
  );

  const toggleNestedReplies = useCallback(
    (replyId: string) => {
      const reply = comments.flatMap((c) => c.replies || []).find((r) => r.id === replyId);
      if (!reply) return;

      const willShow = !reply.showReplies;

      setComments((prev) =>
        prev.map((c) => {
          if (c.replies) {
            const updatedReplies = c.replies.map((r) => {
              if (r.id === replyId) {
                return { ...r, showReplies: willShow };
              }
              return r;
            });
            return { ...c, replies: updatedReplies };
          }
          return c;
        })
      );

      if (willShow && (!reply.nestedReplies || reply.nestedReplies.length === 0)) {
        loadNestedReplies(replyId);
      }
    },
    [comments, loadNestedReplies]
  );

  const deleteComment = useCallback(
    async (commentId: string) => {
      try {
        await api.delete(`/comment/${commentId}`);

        setComments((prev) => {
          const promoted: CommentWithReplies[] = [];

          const remaining = prev.map((c) => {
            if (c.id === commentId) {
              if (c.replies && c.replies.length > 0) {
                c.replies.forEach((r) => {
                  promoted.push({
                    id: r.id,
                    content: r.content,
                    reactionCount: r.reactionsCount,
                    authorId: r.author.id,
                    authorName: r.author.fullName,
                    authorAvatarUrl: r.author.avatarUrl,
                    createdAt: r.createdAt,
                    replyCount: r.replyCount,
                    replies: r.nestedReplies || [],
                    repliesPage: 0,
                    hasMoreReplies: (r.replyCount ?? 0) > 0,
                    showReplies: false,
                    isEdited: r.isEdited,
                    media: r.media,
                    isParentDeleted: true,
                  });
                });
              }
              return null;
            }

            if (c.replies) {
              const replyIndex = c.replies.findIndex((r) => r.id === commentId);
              if (replyIndex !== -1) {
                const deletedReply = c.replies[replyIndex];
                const updatedReplies = c.replies.filter((r) => r.id !== commentId);

                if (deletedReply.nestedReplies && deletedReply.nestedReplies.length > 0) {
                  deletedReply.nestedReplies.forEach((nr) => {
                    promoted.push({
                      id: nr.id,
                      content: nr.content,
                      reactionCount: nr.reactionsCount,
                      authorId: nr.author.id,
                      authorName: nr.author.fullName,
                      authorAvatarUrl: nr.author.avatarUrl,
                      createdAt: nr.createdAt,
                      replyCount: nr.replyCount,
                      replies: [],
                      repliesPage: 0,
                      hasMoreReplies: (nr.replyCount ?? 0) > 0,
                      showReplies: false,
                      isEdited: nr.isEdited,
                      media: nr.media,
                      isParentDeleted: true,
                    });
                  });
                }

                return { ...c, replies: updatedReplies };
              }

              for (const reply of c.replies) {
                if (reply.nestedReplies) {
                  const nestedIndex = reply.nestedReplies.findIndex((nr) => nr.id === commentId);
                  if (nestedIndex !== -1) {
                    const updatedNested = reply.nestedReplies.filter((nr) => nr.id !== commentId);
                    const updatedReplies = c.replies.map((r) => {
                      if (r.id === reply.id) {
                        return { ...r, nestedReplies: updatedNested };
                      }
                      return r;
                    });
                    return { ...c, replies: updatedReplies };
                  }
                }
              }
            }
            return c;
          }).filter((c) => c !== null) as CommentWithReplies[];

          const deletedIndex = prev.findIndex((c) => c.id === commentId);
          if (deletedIndex !== -1) {
            const before = prev.slice(0, deletedIndex);
            const after = prev.slice(deletedIndex + 1);
            return [...before, ...promoted, ...after];
          }
          return remaining;
        });
      } catch (err) {
        console.error("[DeleteComment] Error:", err);
        throw err;
      }
    },
    []
  );

  const editComment = useCallback(
    async (commentId: string, newContent: string) => {
      try {
        await api.patch(`/comment/${commentId}`, { content: newContent });

        setComments((prev) =>
          prev.map((c) => {
            if (c.id === commentId) {
              return { ...c, content: newContent, isEdited: true };
            }
            if (c.replies) {
              const updatedReplies = c.replies.map((r) => {
                if (r.id === commentId) {
                  return { ...r, content: newContent, isEdited: true };
                }
                if (r.nestedReplies) {
                  const updatedNested = r.nestedReplies.map((nr) => {
                    if (nr.id === commentId) {
                      return { ...nr, content: newContent, isEdited: true };
                    }
                    return nr;
                  });
                  return { ...r, nestedReplies: updatedNested };
                }
                return r;
              });
              return { ...c, replies: updatedReplies };
            }
            return c;
          })
        );
      } catch (err) {
        console.error("[EditComment] Error:", err);
        throw err;
      }
    },
    []
  );

  const deleteReply = useCallback(
    async (replyId: string) => {
      try {
        await api.delete(`/comment/${replyId}`);

        setComments((prev) =>
          prev.map((c) => {
            if (c.replies) {
              const replyIndex = c.replies.findIndex((r) => r.id === replyId);
              if (replyIndex !== -1) {
                const deletedReply = c.replies[replyIndex];
                const updatedReplies = c.replies.filter((r) => r.id !== replyId);

                if (deletedReply.nestedReplies && deletedReply.nestedReplies.length > 0) {
                  const promotedNested = deletedReply.nestedReplies.map((nr) => ({
                    ...nr,
                    content: "[Bình luận đã bị xóa]",
                    author: { id: "", fullName: nr.author.fullName, avatarUrl: null },
                    reactionsCount: 0,
                  }));
                  updatedReplies.push(...promotedNested);
                }

                return { ...c, replies: updatedReplies };
              }

              for (const reply of c.replies) {
                if (reply.nestedReplies) {
                  const nestedIndex = reply.nestedReplies.findIndex((nr) => nr.id === replyId);
                  if (nestedIndex !== -1) {
                    const updatedNested = reply.nestedReplies.filter((nr) => nr.id !== replyId);
                    const updatedReplies = c.replies.map((r) => {
                      if (r.id === reply.id) {
                        return { ...r, nestedReplies: updatedNested };
                      }
                      return r;
                    });
                    return { ...c, replies: updatedReplies };
                  }
                }
              }
            }
            return c;
          })
        );
      } catch (err) {
        console.error("[DeleteReply] Error:", err);
        throw err;
      }
    },
    []
  );

  const editReply = useCallback(
    async (replyId: string, newContent: string) => {
      try {
        await api.patch(`/comment/${replyId}`, { content: newContent });

        setComments((prev) =>
          prev.map((c) => {
            if (c.replies) {
              const updatedReplies = c.replies.map((r) => {
                if (r.id === replyId) {
                  return { ...r, content: newContent, isEdited: true };
                }
                if (r.nestedReplies) {
                  const updatedNested = r.nestedReplies.map((nr) => {
                    if (nr.id === replyId) {
                      return { ...nr, content: newContent, isEdited: true };
                    }
                    return nr;
                  });
                  return { ...r, nestedReplies: updatedNested };
                }
                return r;
              });
              return { ...c, replies: updatedReplies };
            }
            return c;
          })
        );
      } catch (err) {
        console.error("[EditReply] Error:", err);
        throw err;
      }
    },
    []
  );

  const incrementCommentCount = useCallback(() => {}, []);
  const decrementCommentCount = useCallback(() => {}, []);

  const incrementReplyCount = useCallback(
    (commentId: string) => {
      setComments((prev) =>
        prev.map((c) => {
          if (c.id === commentId) {
            return { ...c, replyCount: (c.replyCount ?? 0) + 1 };
          }
          if (c.replies) {
            const updatedReplies = c.replies.map((r) => {
              if (r.id === commentId) {
                return { ...r, replyCount: (r.replyCount ?? 0) + 1 };
              }
              return r;
            });
            return { ...c, replies: updatedReplies };
          }
          return c;
        })
      );
    },
    []
  );

  const decrementReplyCount = useCallback(
    (commentId: string) => {
      setComments((prev) =>
        prev.map((c) => {
          if (c.id === commentId) {
            return { ...c, replyCount: Math.max(0, (c.replyCount ?? 0) - 1) };
          }
          if (c.replies) {
            const updatedReplies = c.replies.map((r) => {
              if (r.id === commentId) {
                return { ...r, replyCount: Math.max(0, (r.replyCount ?? 0) - 1) };
              }
              return r;
            });
            return { ...c, replies: updatedReplies };
          }
          return c;
        })
      );
    },
    []
  );

  return {
    comments,
    isLoadingComments,
    isLoadingMore,
    hasMoreLv1,
    expandedCommentIds,
    loadInitialComments,
    loadMoreLv1Comments,
    loadReplies,
    loadNestedReplies,
    toggleReplies,
    toggleNestedReplies,
    setComments,
    deleteComment,
    deleteReply,
    editComment,
    editReply,
    incrementCommentCount,
    decrementCommentCount,
    incrementReplyCount,
    decrementReplyCount,
  };
};
