import { useState, useEffect, useRef } from "react";
import {
  Heart,
  MessageCircle,
  Share2,
  Globe,
  Loader2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  VisuallyHidden,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Link } from "react-router-dom";
import { UserAvatarLink } from "@/components/common/user-link";
import { useAppSelector } from "@/stores/hook";
import { PhotoDialog } from "./photo-dialog";
import { commentService } from "@/services/comment/comment.service";
import { toast } from "sonner";
import api from "@/lib/axios/axios";
import type { PostDetailResponse } from "@/services/post/dtos/response/post-detail.response";
import { getPostAvatar, getPostAuthorName } from "@/services/post/dtos/helpers/post-helpers";
import { useComments } from "./hooks/use-comments";
import type { CommentWithReplies } from "./hooks/use-comments";
import { CommentInputField } from "./components/comment-input-field";
import { CommentItem } from "./components/comment-item/index";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/vi";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(relativeTime);
dayjs.locale("vi");

interface PostDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  post: PostDetailResponse;
  initialMediaIndex?: number;
}

export const PostDetailDialog = ({
  open,
  onOpenChange,
  post,
  initialMediaIndex = 0,
}: PostDetailDialogProps) => {
  const { user: currentUser } = useAppSelector((state) => state.auth);
  const [commentText, setCommentText] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [isLiked, setIsLiked] = useState(false);
  const [photoDialogOpen, setPhotoDialogOpen] = useState(false);
  const [selectedMediaIndex, setSelectedMediaIndex] = useState(initialMediaIndex);
  const [isPostExpanded, setIsPostExpanded] = useState(false);
  const [localCommentCount, setLocalCommentCount] = useState(post.commentCount || 0);
  const [localReactionCount, setLocalReactionCount] = useState(post.reactionCount || 0);
  const loadCountRef = useRef(0);
  const commentsEndRef = useRef<HTMLDivElement>(null);

  const POST_TRUNCATE_LENGTH = 1000;

  const handleOpenChange = (newOpen: boolean) => {
    onOpenChange(newOpen);
  };

  const mediaItems = post.mediaItems || [];

  const formatPostDate = (date: string) => {
    return dayjs.utc(date).tz("Asia/Ho_Chi_Minh").fromNow();
  };

  const formatDate = (date: string) => {
    return dayjs.utc(date).tz("Asia/Ho_Chi_Minh").fromNow();
  };

  const authorName = getPostAuthorName(post);
  const authorAvatar = getPostAvatar(post);

  // Comment management hook
  const {
    comments,
    isLoadingComments,
    isLoadingMore,
    hasMoreLv1,
    loadInitialComments,
    loadMoreLv1Comments,
    loadReplies,
    loadNestedReplies,
    toggleReplies,
    toggleNestedReplies,
    setComments,
    deleteComment,
    editComment,
  } = useComments({
    postId: post.id,
    postCommentCount: post.commentCount || 0,
    open,
  });

  // Reset local counts when dialog opens with new post - only once
  useEffect(() => {
    if (open && loadCountRef.current === 0) {
      loadCountRef.current++;
      setLocalCommentCount(post.commentCount || 0);
      setLocalReactionCount(post.reactionCount || 0);
      loadInitialComments();
    }
  }, [open]);

  // Reset load count when dialog closes
  useEffect(() => {
    if (!open) {
      loadCountRef.current = 0;
    }
  }, [open]);

  // Infinite scroll for Lv1 comments
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMoreLv1 && !isLoadingMore) {
          loadMoreLv1Comments();
        }
      },
      { threshold: 0.1 }
    );

    if (commentsEndRef.current) {
      observer.observe(commentsEndRef.current);
    }

    return () => observer.disconnect();
  }, [hasMoreLv1, isLoadingMore, loadMoreLv1Comments]);

  // Callback to update total comment count (called from CommentItem when deleting Lv1 comment)
  const handleCommentCountChange = (delta: number) => {
    setLocalCommentCount((prev) => Math.max(0, prev + delta));
  };

  const handleSendComment = async () => {
    const trimmed = commentText.trim();
    if (!trimmed) return;

    setCommentText("");

    // Create skeleton comment first (pending state)
    const skeletonId = `pending-${Date.now()}`;
    const skeletonComment: CommentWithReplies = {
      id: skeletonId,
      content: trimmed,
      reactionCount: 0,
      authorId: currentUser?.id || "",
      authorName: currentUser?.fullName || "Unknown",
      authorAvatarUrl: currentUser?.avatarUrl || null,
      createdAt: new Date().toISOString(),
      replyCount: 0,
      replies: [],
      repliesPage: 0,
      hasMoreReplies: false,
      showReplies: false,
      isPending: true,
    };

    setComments((prev) => [...prev, skeletonComment]);
    setLocalCommentCount((prev) => prev + 1);

    try {
      const response = await api.post(`/comment`, {
        PostId: post.id,
        Content: trimmed,
      });

      if (response.data) {
        // Replace skeleton with real comment from API
        setComments((prev) =>
          prev.map((c) => c.id === skeletonId ? {
            id: response.data.id,
            content: response.data.content,
            reactionCount: response.data.reactionsCount || 0,
            authorId: response.data.author?.id || currentUser?.id || "",
            authorName: response.data.author?.fullName || currentUser?.fullName || "Unknown",
            authorAvatarUrl: response.data.author?.avatarUrl || currentUser?.avatarUrl || null,
            createdAt: response.data.createdAt,
            replyCount: 0,
            replies: [],
            repliesPage: 0,
            hasMoreReplies: false,
            showReplies: false,
            isPending: false,
          } : c)
        );
        toast.success("Đã gửi bình luận");
      } else {
        // Remove skeleton on failure
        setComments((prev) => prev.filter((c) => c.id !== skeletonId));
        setLocalCommentCount((prev) => Math.max(0, prev - 1));
      }
    } catch (err) {
      // Remove skeleton on error
      setComments((prev) => prev.filter((c) => c.id !== skeletonId));
      setLocalCommentCount((prev) => Math.max(0, prev - 1));
      const errorResponse = (err as any).response?.data;
      if (errorResponse?.errors) {
        const errorMessages = Object.values(errorResponse.errors).flat().join("\n");
        toast.error(String(errorMessages));
      } else if (errorResponse?.detail) {
        toast.error(String(errorResponse.detail));
      } else {
        toast.error("Không thể gửi bình luận");
      }
    }
  };

  const handleSendReply = async (parentCommentId: string, text?: string) => {
    const trimmed = text ?? replyText.trim();
    if (!trimmed) return;

    setReplyingTo(null);
    setReplyText("");

    // Create skeleton comment first (pending state)
    const skeletonId = `pending-${Date.now()}`;
    const skeletonReply = {
      id: skeletonId,
      content: trimmed,
      reactionsCount: 0,
      replyCount: 0,
      author: {
        id: currentUser?.id || "",
        fullName: currentUser?.fullName || "Unknown",
        avatarUrl: currentUser?.avatarUrl || null,
      },
      createdAt: new Date().toISOString(),
      showReplies: false,
      nestedReplies: [],
      nestedRepliesPage: 0,
      hasMoreNestedReplies: false,
      isPending: true,
    };

    // Add skeleton to correct position first
    setComments((prev) =>
      prev.map((c) => {
        // Reply to level 1 comment - add skeleton to level 2
        if (c.id === parentCommentId) {
          return {
            ...c,
            replies: [...(c.replies || []), skeletonReply],
            replyCount: (c.replyCount ?? 0) + 1,
            showReplies: true,
          };
        }
        // Reply to level 2 comment - add skeleton to its nestedReplies (Lv3)
        if (c.replies) {
          const replyIndex = c.replies.findIndex((r) => r.id === parentCommentId);
          if (replyIndex !== -1) {
            const updatedReplies = c.replies.map((r) => {
              if (r.id === parentCommentId) {
                return {
                  ...r,
                  nestedReplies: [...(r.nestedReplies || []), skeletonReply],
                  replyCount: (r.replyCount ?? 0) + 1,
                  showReplies: true,
                };
              }
              return r;
            });
            return { ...c, replies: updatedReplies };
          }
          // Reply to level 3 comment - add skeleton as new Lv3 under same Lv2 parent
          for (const reply of c.replies) {
            if (reply.nestedReplies) {
              const nestedIndex = reply.nestedReplies.findIndex((nr) => nr.id === parentCommentId);
              if (nestedIndex !== -1) {
                const updatedReplies = c.replies.map((r) => {
                  if (r.id === reply.id) {
                    return {
                      ...r,
                      nestedReplies: [...(r.nestedReplies || []), skeletonReply],
                      replyCount: (r.replyCount ?? 0) + 1,
                    };
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

    // Now call API
    try {
      const response = await api.post(`/comment`, {
        PostId: post.id,
        ParentCommentId: parentCommentId,
        Content: trimmed,
      });
      
      // Success - replace skeleton with real comment from API
      if (response.data) {
        const realComment = {
          id: response.data.id,
          content: response.data.content,
          reactionsCount: response.data.reactionsCount || 0,
          replyCount: 0,
          author: {
            id: response.data.author?.id || currentUser?.id || "",
            fullName: response.data.author?.fullName || currentUser?.fullName || "Unknown",
            avatarUrl: response.data.author?.avatarUrl || currentUser?.avatarUrl || null,
          },
          createdAt: response.data.createdAt,
          showReplies: false,
          nestedReplies: [],
          nestedRepliesPage: 0,
          hasMoreNestedReplies: false,
          isPending: false,
        };

        // Replace skeleton with real comment at correct position
        setComments((prev) =>
          prev.map((c) => {
            // Check Lv2 replies
            if (c.replies) {
              const updatedReplies = c.replies.map((r) => {
                if (r.id === skeletonId) {
                  return realComment;
                }
                // Check Lv3 nested replies
                if (r.nestedReplies) {
                  const updatedNested = r.nestedReplies.map((nr) => {
                    if (nr.id === skeletonId) {
                      return realComment;
                    }
                    return nr;
                  });
                  if (updatedNested.some((nr: any) => nr.id === response.data.id)) {
                    return { ...r, nestedReplies: updatedNested };
                  }
                }
                return r;
              });
              if (updatedReplies.some((r: any) => r.id === response.data.id)) {
                return { ...c, replies: updatedReplies };
              }
            }
            return c;
          })
        );
        toast.success("Đã gửi phản hồi");
      } else {
        // Remove skeleton on failure
        setComments((prev) =>
          prev.map((c) => ({
            ...c,
            replies: c.replies?.filter((r) => r.id !== skeletonId),
          }))
        );
      }
    } catch (err) {
      console.error("[handleSendReply] Error:", err);
      // Remove skeleton on error
      setComments((prev) =>
        prev.map((c) => ({
          ...c,
          replies: c.replies?.filter((r) => r.id !== skeletonId),
        }))
      );
      const errorResponse = (err as any).response?.data;
      if (errorResponse?.errors) {
        const errorMessages = Object.values(errorResponse.errors).flat().join("\n");
        toast.error(String(errorMessages));
      } else if (errorResponse?.detail) {
        toast.error(String(errorResponse.detail));
      } else {
        toast.error("Không thể gửi phản hồi.");
      }
    }
  };

  // Handle reply click - auto-tag the user being replied to
  const handleReplyClick = (replyId: string, replyAuthorName: string, replyAuthorId: string) => {
    // If replying to someone else (not self), auto-tag
    if (replyAuthorId !== currentUser?.id) {
      setReplyText(`@${replyAuthorName} `);
    }
    setReplyingTo(replyId);
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
  };

  const formatCount = (count: number | undefined): string => {
    if (!count) return "0";
    if (count >= 1000) {
      return (count / 1000).toFixed(1).replace(/\.0$/, "") + "K";
    }
    return count.toString();
  };

  const getGridLayoutClass = (count: number): string => {
    switch (count) {
      case 1:
        return "grid-cols-1";
      case 2:
        return "grid-cols-2";
      case 3:
        return "grid-cols-2 grid-rows-2";
      case 4:
        return "grid-cols-2 grid-rows-2";
      default:
        return "grid-cols-2 grid-rows-2";
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="!max-w-4xl w-[33vw] max-h-[95vh] p-0 gap-0 overflow-hidden !rounded-xl"
        showCloseButton={true}
      >
        <VisuallyHidden asChild>
          <DialogTitle>Chi tiết bài viết</DialogTitle>
        </VisuallyHidden>
        <div className="flex flex-col max-h-[93vh]">
          {/* Header */}
          <div className="flex-shrink-0 p-5 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <UserAvatarLink
                  userId={post.author.id}
                  avatarUrl={authorAvatar}
                  name={authorName}
                  className="h-11 w-11"
                />
                <div>
                  <Link
                    to={`/profile/${post.author.id}`}
                    className="font-bold hover:underline text-[18px] block"
                  >
                    {authorName}
                  </Link>
                  <div className="flex items-center gap-1.5 text-muted-foreground text-[12px]">
                    <span>{formatPostDate(post.createdAt)}</span>
                    <span>•</span>
                    <Globe className="h-3 w-3" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Scrollable Content */}
          <ScrollArea className="flex-1 min-h-0">
            <div className="p-5 space-y-5">
              {/* Post Content */}
              {post.content && (
                <div>
                  <p className="text-[18px] leading-relaxed whitespace-pre-wrap break-words">
                    {isPostExpanded
                      ? post.content
                      : post.content.length > POST_TRUNCATE_LENGTH
                        ? post.content.slice(0, POST_TRUNCATE_LENGTH) + "..."
                        : post.content}
                  </p>
                  {post.content.length > POST_TRUNCATE_LENGTH && (
                    <button
                      className="text-[14px] font-semibold text-blue-600 hover:text-blue-700 mt-1"
                      onClick={() => setIsPostExpanded(!isPostExpanded)}
                    >
                      {isPostExpanded ? "Ẩn bớt" : "Xem thêm"}
                    </button>
                  )}
                </div>
              )}

              {/* Image Grid */}
              {mediaItems.length > 0 && (
                <div
                  className={`grid ${getGridLayoutClass(mediaItems.length)} gap-1 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800`}
                >
                  {mediaItems.slice(0, 4).map((media, index) => (
                    <div
                      key={media.id || index}
                      className="relative overflow-hidden bg-black/5 aspect-square cursor-pointer"
                      onClick={() => {
                        setSelectedMediaIndex(index);
                        setPhotoDialogOpen(true);
                      }}
                    >
                      <img
                        src={media.url}
                        alt={`Media ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      {index === 3 && mediaItems.length > 4 && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <span className="text-white text-2xl font-bold">
                            +{mediaItems.length - 4}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Photo Dialog */}
              <PhotoDialog
                open={photoDialogOpen}
                onOpenChange={setPhotoDialogOpen}
                post={post}
                initialMediaIndex={selectedMediaIndex}
              />

              {/* Interaction Buttons Row */}
              <div className="flex items-center gap-3 py-4 border-y border-slate-100 dark:border-slate-800">
                <Button
                  variant="ghost"
                  className={`flex-1 rounded-xl h-auto py-3 flex items-center justify-center gap-3 transition-all text-sm ${
                    isLiked
                      ? "text-blue-600 hover:text-blue-700 bg-blue-50 dark:bg-blue-950/30"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  onClick={handleLike}
                >
                  <Heart className={`h-5 w-5 ${isLiked ? "fill-current" : ""}`} />
                  <span className="font-medium">
                    {formatCount(localReactionCount || 0)} Likes
                  </span>
                </Button>

                <Button
                  variant="ghost"
                  className="flex-1 rounded-xl h-auto py-3 flex items-center justify-center gap-3 text-muted-foreground hover:text-foreground text-sm"
                >
                  <MessageCircle className="h-5 w-5" />
                  <span className="font-medium">
                    {formatCount(localCommentCount || 0)} Comments
                  </span>
                </Button>

                <Button
                  variant="ghost"
                  className="flex-1 rounded-xl h-auto py-3 flex items-center justify-center gap-3 text-muted-foreground hover:text-foreground text-sm"
                >
                  <Share2 className="h-5 w-5" />
                  <span className="font-medium">
                    {formatCount(post.shareCount || 0)} Shares
                  </span>
                </Button>
              </div>

              {/* Comments Section */}
              <div className="space-y-5">
                <h3 className="font-semibold text-[16px] text-muted-foreground">Bình luận</h3>

                {isLoadingComments ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex gap-3">
                        <div className="h-10 w-10 rounded-full bg-slate-200 dark:bg-slate-700" />
                        <div className="flex-1 h-14 bg-slate-200 dark:bg-slate-700 rounded-xl" />
                      </div>
                    ))}
                  </div>
                ) : comments.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p className="text-sm">Chưa có bình luận nào</p>
                  </div>
                ) : (
                  <>
                    {comments.map((comment) => (
                    <CommentItem
                      key={comment.id}
                      comment={comment}
                      postId={post.id}
                      currentUser={currentUser}
                      postAuthorId={post.author.id}
                      formatDate={formatDate}
                        replyingTo={replyingTo}
                        setReplyingTo={setReplyingTo}
                        replyText={replyText}
                        setReplyText={setReplyText}
                        onSendReply={handleSendReply}
                        onReplyClick={handleReplyClick}
                        toggleReplies={toggleReplies}
                        toggleNestedReplies={toggleNestedReplies}
                        loadReplies={loadReplies}
                        loadNestedReplies={loadNestedReplies}
                        onDeleteComment={deleteComment}
                        onEditComment={editComment}
                        onCommentCountChange={handleCommentCountChange}
                        onReplyCountChange={(commentId, delta) => {
                          // Find the parent comment and update its reply count
                          setComments((prev) =>
                            prev.map((c) => {
                              if (c.id === commentId) {
                                return { ...c, replyCount: Math.max(0, (c.replyCount ?? 0) + delta) };
                              }
                              if (c.replies) {
                                const updatedReplies = c.replies.map((r) => {
                                  if (r.id === commentId) {
                                    return { ...r, replyCount: Math.max(0, (r.replyCount ?? 0) + delta) };
                                  }
                                  return r;
                                });
                                return { ...c, replies: updatedReplies };
                              }
                              return c;
                            })
                          );
                        }}
                        isPending={false}
                      />
                    ))}
                    {/* Infinite scroll trigger */}
                    <div ref={commentsEndRef} className="h-4" />
                    {isLoadingMore && (
                      <div className="flex items-center justify-center py-2">
                        <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                      </div>
                    )}
                    {/* Load more Lv1 comments button */}
                    {hasMoreLv1 && (
                      <button
                        className="w-full py-3 text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center justify-center gap-2"
                        onClick={loadMoreLv1Comments}
                        disabled={isLoadingMore}
                      >
                        {isLoadingMore ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Đang tải...
                          </>
                        ) : (
                          "Xem thêm bình luận..."
                        )}
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          </ScrollArea>

          {/* Footer - Comment Input */}
          <div className="flex-shrink-0 p-5 border-t bg-white dark:bg-slate-900">
            <CommentInputField
              value={commentText}
              onChange={setCommentText}
              onSubmit={handleSendComment}
              onMediaSubmit={async (media) => {
                // Add media comment locally (optimistic update)
                const newComment: CommentWithReplies = {
                  id: `temp-${Date.now()}`,
                  content: commentText || " ",
                  reactionCount: 0,
                  authorId: currentUser?.id || "",
                  authorName: currentUser?.fullName || "Unknown",
                  authorAvatarUrl: currentUser?.avatarUrl || null,
                  createdAt: new Date().toISOString(),
                  replyCount: 0,
                  replies: [],
                  repliesPage: 0,
                  hasMoreReplies: false,
                  showReplies: false,
                  media,
                };

                setComments((prev) => [...prev, newComment]);
                setCommentText("");
                setLocalCommentCount((prev) => prev + 1);

                const result = await commentService.createComment({
                  postId: post.id,
                  content: commentText || " ",
                  parentCommentId: null,
                  media,
                });
                if (result.isSuccess) {
                  // Replace temp id with real id
                  setComments((prev) =>
                    prev.map((c) => c.id.startsWith("temp-") ? { ...c, id: (result as any).value?.id || c.id } : c)
                  );
                  toast.success("Đã gửi bình luận");
                } else {
                  // Remove temp comment on error
                  setComments((prev) => prev.filter((c) => !c.id.startsWith("temp-")));
                  setLocalCommentCount((prev) => Math.max(0, prev - 1));
                  const errorData = result.error;
                  if (errorData?.errors) {
                    const errorMessages = Object.values(errorData.errors).flat().join("\n");
                    toast.error(String(errorMessages || "Lỗi validation không xác định"));
                  } else {
                    toast.error(String(errorData?.message || "Không thể gửi bình luận"));
                  }
                }
              }}
              isPending={false}
              placeholder="Viết bình luận..."
              currentUserAvatar={currentUser?.avatarUrl}
              currentUserName={currentUser?.fullName}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
