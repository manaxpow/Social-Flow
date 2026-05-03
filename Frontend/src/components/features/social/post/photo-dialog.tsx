import { useState, useEffect, useRef } from "react";
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  MoreHorizontal,
  Globe,
  ChevronLeft,
  ChevronRight,
  X,
  Send,
  Smile,
  Image as ImageIcon
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  VisuallyHidden,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Link } from "react-router-dom";
import { UserAvatarLink } from "@/components/common/user-link";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { PostDetailResponse } from "@/services/post/dtos/response/post-detail.response";
import { getPostAvatar, getPostAuthorName } from "@/services/post/dtos/helpers/post-helpers";
import { commentService } from "@/services/comment/comment.service";
import type { CommentWithReplies, ReplyItem } from "./hooks/use-comments";
import { useAppSelector } from "@/stores/hook";
import { CommentItem } from "./components/comment-item";
import { CommentInputField } from "./components/comment-input-field";
import { useComments } from "./hooks/use-comments";
import api from "@/lib/axios/axios";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/vi";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(relativeTime);
dayjs.locale("vi");

interface PhotoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  post: PostDetailResponse;
  initialMediaIndex?: number;
}

export const PhotoDialog = ({
  open,
  onOpenChange,
  post,
  initialMediaIndex = 0,
}: PhotoDialogProps) => {
  const { user: currentUser } = useAppSelector((state) => state.auth);
  const queryClient = useQueryClient();
  const [currentMediaIndex, setCurrentMediaIndex] = useState(initialMediaIndex);
  const [commentText, setCommentText] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [isLiked, setIsLiked] = useState(false);
  const [postContentExpanded, setPostContentExpanded] = useState(false);
  const loadCountRef = useRef(0);
  const commentsEndRef = useRef<HTMLDivElement>(null);

  // Comment management using shared hook (same as post-detail-dialog)
  const {
    comments,
    setComments,
    isLoadingComments,
    isLoadingMore,
    hasMoreLv1,
    loadInitialComments,
    loadMoreLv1Comments,
    loadReplies,
    loadNestedReplies,
    toggleReplies,
    toggleNestedReplies,
    deleteComment,
    editComment,
  } = useComments({
    postId: post.id,
    postCommentCount: post.commentCount || 0,
    open,
  });

  // Load comments when dialog opens - only once on open
  useEffect(() => {
    if (open && loadCountRef.current === 0) {
      loadCountRef.current++;
      console.log(`[PhotoDialog] Loading comments, count: ${loadCountRef.current}`);
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

  // Sync currentMediaIndex when initialMediaIndex changes or when dialog opens
  useEffect(() => {
    if (open) {
      setCurrentMediaIndex(initialMediaIndex);
      setPostContentExpanded(false);
    }
  }, [open, initialMediaIndex]);

  const handleOpenChange = (newOpen: boolean) => {
    onOpenChange(newOpen);
  };

  const mediaItems = post.mediaItems || [];
  const currentMedia = mediaItems[currentMediaIndex];

  const goToPrevious = () => {
    setCurrentMediaIndex((prev) => 
      prev === 0 ? mediaItems.length - 1 : prev - 1
    );
  };

  const goToNext = () => {
    setCurrentMediaIndex((prev) => 
      prev === mediaItems.length - 1 ? 0 : prev + 1
    );
  };

  const formatPostDate = (date: string) => {
    return dayjs.utc(date).tz("Asia/Ho_Chi_Minh").fromNow();
  };

  const formatDate = (date: string) => {
    return dayjs.utc(date).tz("Asia/Ho_Chi_Minh").fromNow();
  };

  const authorName = getPostAuthorName(post);
  const authorAvatar = getPostAvatar(post);

  // Add new comment with skeleton approach
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
      }
    } catch (err) {
      // Remove skeleton on error
      setComments((prev) => prev.filter((c) => c.id !== skeletonId));
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

  // Handle reply with skeleton approach
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
      status: 'pending' as const,
    };

    // Add skeleton to correct position first
    setComments((prev: CommentWithReplies[]) =>
      prev.map((c: CommentWithReplies) => {
        // Reply to Lv1 comment - add skeleton to Lv2
        if (c.id === parentCommentId) {
          return {
            ...c,
            replies: [...(c.replies || []), skeletonReply as ReplyItem],
            replyCount: (c.replyCount ?? 0) + 1,
            showReplies: true,
          };
        }
        // Reply to Lv2 comment - add skeleton to its nestedReplies (Lv3)
        if (c.replies) {
          const replyIndex = c.replies.findIndex((r: ReplyItem) => r.id === parentCommentId);
          if (replyIndex !== -1) {
            const updatedReplies = c.replies.map((r: ReplyItem) => {
              if (r.id === parentCommentId) {
                return {
                  ...r,
                  nestedReplies: [...(r.nestedReplies || []), skeletonReply as ReplyItem],
                  replyCount: (r.replyCount ?? 0) + 1,
                  showReplies: true,
                };
              }
              return r;
            });
            return { ...c, replies: updatedReplies };
          }
          // Reply to Lv3 comment - add skeleton as new Lv3 under same Lv2 parent
          for (const reply of c.replies) {
            if (reply.nestedReplies) {
              const nestedIndex = reply.nestedReplies.findIndex((nr: ReplyItem) => nr.id === parentCommentId);
              if (nestedIndex !== -1) {
                const updatedReplies = c.replies.map((r: ReplyItem) => {
                  if (r.id === reply.id) {
                    return {
                      ...r,
                      nestedReplies: [...(r.nestedReplies || []), skeletonReply as ReplyItem],
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
          status: 'success' as const,
        };

        // Replace skeleton with real comment at correct position
        setComments((prev: CommentWithReplies[]) =>
          prev.map((c: CommentWithReplies) => {
            // Check Lv2 replies
            if (c.replies) {
              const updatedReplies = c.replies.map((r: ReplyItem) => {
                if (r.id === skeletonId) {
                  return realComment;
                }
                // Check Lv3 nested replies
                if (r.nestedReplies) {
                  const updatedNested = r.nestedReplies.map((nr: ReplyItem) => {
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
    if (replyAuthorId !== currentUser?.id) {
      setReplyText(`@${replyAuthorName} `);
    }
    setReplyingTo(replyId);
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
  };

  const handleKeyDown = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      action();
    }
  };

  // Format numbers with K suffix
  const formatCount = (count: number | undefined): string => {
    if (!count) return "0";
    if (count >= 1000) {
      return (count / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    }
    return count.toString();
  };

  // Handle delete comment - strict no reload, local state only
  const handleDeleteComment = async (commentId: string) => {
    try {
      await deleteComment(commentId);
      // No invalidateQueries - local state already updated
      toast.success("Đã xóa bình luận");
    } catch {
      toast.error("Không thể xóa bình luận");
    }
  };

  // Handle edit comment
  const handleEditComment = async (commentId: string, newContent: string) => {
    try {
      await editComment(commentId, newContent);
      toast.success("Đã cập nhật bình luận");
    } catch {
      toast.error("Không thể cập nhật bình luận");
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent 
        className="!max-w-none !mt-0 !mb-0 w-full h-full max-h-[100vh] p-0 gap-0 overflow-hidden !rounded-xl"
        showCloseButton={true}
      >
        <VisuallyHidden asChild>
          <DialogTitle>Xem ảnh</DialogTitle>
        </VisuallyHidden>
        <div className="flex flex-row h-full max-h-[100vh]">
          
          {/* Left Column - Single Image (75%) */}
          <div className="flex-[3] bg-black flex-shrink-0 relative flex items-center justify-center min-w-0">
            
            {/* Close button - Top Left */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-3 left-3 h-9 w-9 rounded-full bg-black/50 hover:bg-black/70 text-white z-20"
              onClick={() => onOpenChange(false)}
            >
              <X className="h-5 w-5" />
            </Button>
            
            {currentMedia && (
              <img
                src={currentMedia.url}
                alt={`Media ${currentMediaIndex + 1}`}
                className="max-w-full max-h-full object-contain"
              />
            )}
            
            {/* Navigation arrows */}
            {mediaItems.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-12 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-black/50 hover:bg-black/70 text-white z-10"
                  onClick={goToPrevious}
                >
                  <ChevronLeft className="h-6 w-6" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-black/50 hover:bg-black/70 text-white z-10"
                  onClick={goToNext}
                >
                  <ChevronRight className="h-6 w-6" />
                </Button>
                
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/50 px-3 py-1 rounded-full text-white text-xs flex items-center gap-1 z-10">
                  {currentMediaIndex + 1} / {mediaItems.length}
                </div>
              </>
            )}
          </div>

          {/* Right Column - Post Details (25%) */}
          <div className="flex-[1] min-w-[350px] max-w-[450px] flex flex-col bg-white dark:bg-slate-900 max-h-full border-l border-slate-200 dark:border-slate-800">
            
            {/* Sticky Header */}
            <div className="flex-shrink-0 p-4 border-b sticky top-0 bg-white dark:bg-slate-900 z-10">
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
                      className="font-bold hover:underline text-[15px] block"
                    >
                      {authorName}
                    </Link>
                    <div className="flex items-center gap-1 text-muted-foreground text-[12px]">
                      <span>{formatPostDate(post.createdAt)}</span>
                      <Globe className="h-3 w-3" />
                    </div>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full">
                  <MoreHorizontal className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Scrollable Content Area */}
            <ScrollArea className="flex-1 min-h-0">
              <div className="p-4 space-y-4">
                
                {/* Post Content - Truncate if > 500 chars */}
                {post.content && (
                  <>
                    <p className="text-[15px] leading-relaxed whitespace-pre-wrap break-words">
                      {post.content.length > 500 && !postContentExpanded 
                        ? post.content.slice(0, 500) + "..." 
                        : post.content}
                    </p>
                    {post.content.length > 500 && (
                      <button
                        className="text-[14px] font-semibold text-blue-600 hover:text-blue-700"
                        onClick={() => setPostContentExpanded(!postContentExpanded)}
                      >
                        {postContentExpanded ? "Ẩn bớt" : "Xem thêm"}
                      </button>
                    )}
                  </>
                )}

                {/* Interaction Buttons Row */}
                <div className="flex items-center gap-2 py-3 border-y border-slate-100 dark:border-slate-800">
                  <Button
                    variant="ghost"
                    className={`flex-1 rounded-lg h-auto py-2.5 flex items-center justify-center gap-2 transition-all text-sm ${
                      isLiked 
                        ? "text-blue-600 hover:text-blue-700 bg-blue-50 dark:bg-blue-950/30" 
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                    onClick={handleLike}
                  >
                    <Heart className={`h-5 w-5 ${isLiked ? "fill-current" : ""}`} />
                    <span className="font-medium">
                      {formatCount(post.reactionCount || 0)}
                    </span>
                  </Button>
                  
                  <Button
                    variant="ghost"
                    className="flex-1 rounded-lg h-auto py-2.5 flex items-center justify-center gap-2 text-muted-foreground hover:text-foreground text-sm"
                  >
                    <MessageCircle className="h-5 w-5" />
                    <span className="font-medium">
                      {formatCount(post.commentCount || 0)}
                    </span>
                  </Button>
                  
                  <Button
                    variant="ghost"
                    className="flex-1 rounded-lg h-auto py-2.5 flex items-center justify-center gap-2 text-muted-foreground hover:text-foreground text-sm"
                  >
                    <Share2 className="h-5 w-5" />
                    <span className="font-medium">
                      {formatCount(post.shareCount || 0)}
                    </span>
                  </Button>
                </div>

                {/* Comments Section - Using shared CommentItem (same as post-detail-dialog) */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-[15px] text-muted-foreground">Bình luận</h3>
                  
                  {isLoadingComments ? (
                    <div className="space-y-3">
                      {[1, 2].map((i) => (
                        <div key={i} className="flex gap-3">
                          <div className="h-9 w-9 rounded-full bg-slate-200 dark:bg-slate-700" />
                          <div className="flex-1 h-12 bg-slate-200 dark:bg-slate-700 rounded-lg" />
                        </div>
                      ))}
                    </div>
                  ) : comments.length === 0 ? (
                    <div className="text-center py-6 text-muted-foreground">
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
                          onDeleteComment={handleDeleteComment}
                          onEditComment={handleEditComment}
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
                      {/* Load more Lv1 comments button (matching post-detail-dialog) */}
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

            {/* Sticky Footer - Comment Input */}
            <div className="flex-shrink-0 p-4 border-t sticky bottom-0 bg-white dark:bg-slate-900 z-10">
              <CommentInputField
                value={commentText}
                onChange={setCommentText}
                onSubmit={handleSendComment}
                onMediaSubmit={async (media) => {
                  // Add media comment locally
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
                    toast.error("Không thể gửi bình luận");
                  }
                }}
                isPending={false}
                placeholder="Viết bình luận..."
                currentUserAvatar={currentUser?.avatarUrl}
                currentUserName={currentUser?.fullName}
              />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
