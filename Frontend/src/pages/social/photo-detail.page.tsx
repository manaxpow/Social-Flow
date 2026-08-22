import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useSearchParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Heart,
  MessageCircle,
  Share2,
  MoreHorizontal,
  Globe,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { UserAvatarLink } from "@/components/common/user-link";
import { toast } from "sonner";
import { postService } from "@/services/post/post.service";
import { commentService } from "@/services/comment/comment.service";
import { getPostAvatar, getPostAuthorName, getPostActionText } from "@/services/post/dtos/helpers/post-helpers";
import { useComments, type CommentWithReplies } from "@/hooks/useComments";
import { useAppSelector } from "@/stores/hook";
import { CommentItem } from "@/components/features/social/post/components/comment-item";
import { CommentInputField } from "@/components/features/social/post/components/comment-input-field";
import api from "@/lib/axios/axios";
import { formatPostDate, formatRelativeTime as formatDate } from "@/utils/date";

export const PhotoDetailPage = () => {
  const { postId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAppSelector((state) => state.auth);

  const initialIndex = parseInt(searchParams.get("index") || "0", 10);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(
    isNaN(initialIndex) ? 0 : initialIndex
  );

  const [commentText, setCommentText] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [isLiked, setIsLiked] = useState(false);
  const [postContentExpanded, setPostContentExpanded] = useState(false);
  const loadCountRef = useRef(0);
  const commentsEndRef = useRef<HTMLDivElement>(null);

  // Fetch Post details
  const { data: response, isLoading: isPostLoading, isError } = useQuery({
    queryKey: ["post", postId],
    queryFn: () => postService.getPostById(postId!),
    enabled: !!postId,
  });

  const post = response?.data;

  // Comments hook
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
    postId: postId || "",
    postCommentCount: post?.commentCount || 0,
    open: !!post,
  });

  useEffect(() => {
    if (post && loadCountRef.current === 0) {
      loadCountRef.current++;
      loadInitialComments();
    }
  }, [post]);

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

  if (isPostLoading) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center text-white z-50">
        <Loader2 className="h-10 w-10 animate-spin text-[#0061FF]" />
      </div>
    );
  }

  if (isError || !post) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <p className="text-lg text-muted-foreground mb-4">
          Photo or post not found or has been deleted.
        </p>
        <Button variant="outline" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Quay lại
        </Button>
      </div>
    );
  }

  const mediaItems = post.mediaItems || [];
  const currentMedia = mediaItems[currentMediaIndex] || mediaItems[0];

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

  const authorName = getPostAuthorName(post);
  const actionText = getPostActionText(post.type);
  const authorAvatar = getPostAvatar(post);
  const isAvatarUpdate = post.type && String(post.type).toLowerCase().includes("avatar");

  // Add new comment
  const handleSendComment = async () => {
    const trimmed = commentText.trim();
    if (!trimmed) return;

    setCommentText("");

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
      const res = await api.post(`/comment`, {
        PostId: post.id,
        Content: trimmed,
      });

      if (res.data) {
        setComments((prev) =>
          prev.map((c) =>
            c.id === skeletonId
              ? {
                id: res.data.id,
                content: res.data.content,
                reactionCount: res.data.reactionsCount || 0,
                authorId: res.data.author?.id || currentUser?.id || "",
                authorName: res.data.author?.fullName || currentUser?.fullName || "Unknown",
                authorAvatarUrl: res.data.author?.avatarUrl || currentUser?.avatarUrl || null,
                createdAt: res.data.createdAt,
                replyCount: 0,
                replies: [],
                repliesPage: 0,
                hasMoreReplies: false,
                showReplies: false,
                isPending: false,
              }
              : c
          )
        );
        toast.success("Đã gửi bình luận");
      } else {
        setComments((prev) => prev.filter((c) => c.id !== skeletonId));
      }
    } catch {
      setComments((prev) => prev.filter((c) => c.id !== skeletonId));
      toast.error("Không thể gửi bình luận");
    }
  };

  // Handle reply comment
  const handleSendReply = async (parentCommentId: string, text?: string) => {
    const trimmed = text ?? replyText.trim();
    if (!trimmed) return;

    setReplyingTo(null);
    setReplyText("");

    try {
      const response = await api.post(`/comment`, {
        PostId: post.id,
        ParentCommentId: parentCommentId,
        Content: trimmed,
      });

      if (response.data) {
        toast.success("Đã gửi phản hồi");
        loadInitialComments();
      }
    } catch {
      toast.error("Không thể gửi phản hồi");
    }
  };

  const handleReplyClick = (replyId: string, replyAuthorName: string, replyAuthorId: string) => {
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

  const handleDeleteComment = async (commentId: string) => {
    try {
      await deleteComment(commentId);
      toast.success("Đã xóa bình luận");
    } catch {
      toast.error("Không thể xóa bình luận");
    }
  };

  const handleEditComment = async (commentId: string, newContent: string) => {
    try {
      await editComment(commentId, newContent);
      toast.success("Đã cập nhật bình luận");
    } catch {
      toast.error("Không thể cập nhật bình luận");
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col lg:flex-row overflow-hidden">
      {/* Left Column - Main Media View (75% / Full screen on mobile) */}
      <div className="flex-1 bg-black relative flex items-center justify-center min-w-0 min-h-[50vh] lg:min-h-full">
        {/* Back button - Top Left */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 left-4 h-10 w-10 rounded-full bg-black/60 hover:bg-black/80 text-white z-30 cursor-pointer"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>

        {currentMedia && (
          currentMedia.mediaType === "Video" ? (
            <video
              src={currentMedia.url}
              controls
              autoPlay
              className="max-w-full max-h-full object-contain"
            />
          ) : isAvatarUpdate ? (
            <div className="w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 rounded-full overflow-hidden border-4 border-background ring-4 ring-[#1877f2]/50 shadow-2xl transition-transform duration-300 hover:scale-105">
              <img
                src={currentMedia.url}
                alt={authorName}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <img
              src={currentMedia.url}
              alt={`Media ${currentMediaIndex + 1}`}
              className="max-w-full max-h-full object-contain"
            />
          )
        )}

        {/* Navigation arrows */}
        {mediaItems.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-4 top-1/2 -translate-y-1/2 h-11 w-11 rounded-full bg-black/60 hover:bg-black/80 text-white z-20 cursor-pointer"
              onClick={goToPrevious}
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 top-1/2 -translate-y-1/2 h-11 w-11 rounded-full bg-black/60 hover:bg-black/80 text-white z-20 cursor-pointer"
              onClick={goToNext}
            >
              <ChevronRight className="h-6 w-6" />
            </Button>

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 px-4 py-1.5 rounded-full text-white text-xs font-medium z-20">
              {currentMediaIndex + 1} / {mediaItems.length}
            </div>
          </>
        )}
      </div>

      {/* Right Column - Post Details & Comments (25% / Sidebar) */}
      <div className="w-full lg:w-[420px] shrink-0 flex flex-col bg-background dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 h-[50vh] lg:h-full">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 shrink-0 bg-background dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <UserAvatarLink
                userId={post.author.id}
                avatarUrl={authorAvatar}
                name={authorName}
                className="h-10 w-10"
              />
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5 flex-wrap leading-tight">
                  <Link
                    to={`/profile/${post.author.id}`}
                    className="font-bold hover:underline text-[15px] text-foreground"
                  >
                    {authorName}
                  </Link>
                  {actionText && (
                    <span className="text-muted-foreground text-[14px] font-normal">
                      {actionText}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1 text-muted-foreground text-[12px] mt-0.5">
                  <span>{formatPostDate(post.createdAt)}</span>
                  <span>•</span>
                  <Globe className="h-3 w-3" />
                </div>
              </div>
            </div>
            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full cursor-pointer">
              <MoreHorizontal className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Scrollable Content */}
        <ScrollArea className="flex-1 min-h-0">
          <div className="p-4 space-y-4">
            {/* Content text */}
            {post.content && (
              <>
                <p className="text-[14px] leading-relaxed whitespace-pre-wrap break-words text-foreground">
                  {post.content.length > 300 && !postContentExpanded
                    ? post.content.slice(0, 300) + "..."
                    : post.content}
                </p>
                {post.content.length > 300 && (
                  <button
                    className="text-[13px] font-semibold text-[#0061FF] hover:underline cursor-pointer"
                    onClick={() => setPostContentExpanded(!postContentExpanded)}
                  >
                    {postContentExpanded ? "Ẩn bớt" : "Xem thêm"}
                  </button>
                )}
              </>
            )}

            {/* Interaction Buttons Row */}
            <div className="flex items-center gap-2 py-2 border-y border-slate-200 dark:border-slate-800">
              <Button
                variant="ghost"
                className={`flex-1 rounded-lg py-2 flex items-center justify-center gap-2 text-sm cursor-pointer ${isLiked
                  ? "text-[#0061FF] bg-blue-50 dark:bg-blue-950/40"
                  : "text-muted-foreground hover:text-foreground"
                  }`}
                onClick={handleLike}
              >
                <Heart className={`h-4 w-4 ${isLiked ? "fill-current" : ""}`} />
                <span className="font-medium">{formatCount(post.reactionCount || 0)}</span>
              </Button>

              <Button
                variant="ghost"
                className="flex-1 rounded-lg py-2 flex items-center justify-center gap-2 text-muted-foreground hover:text-foreground text-sm cursor-pointer"
              >
                <MessageCircle className="h-4 w-4" />
                <span className="font-medium">{formatCount(post.commentCount || 0)}</span>
              </Button>

              <Button
                variant="ghost"
                className="flex-1 rounded-lg py-2 flex items-center justify-center gap-2 text-muted-foreground hover:text-foreground text-sm cursor-pointer"
              >
                <Share2 className="h-4 w-4" />
                <span className="font-medium">{formatCount(post.shareCount || 0)}</span>
              </Button>
            </div>

            {/* Comments List */}
            <div className="space-y-4 pt-1">
              <h3 className="font-semibold text-sm text-muted-foreground">Bình luận</h3>

              {isLoadingComments ? (
                <div className="space-y-3">
                  {[1, 2].map((i) => (
                    <div key={i} className="flex gap-3">
                      <div className="h-8 w-8 rounded-full bg-slate-200 dark:bg-slate-700 animate-pulse" />
                      <div className="flex-1 h-10 rounded-lg bg-slate-200 dark:bg-slate-700 animate-pulse" />
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
                  <div ref={commentsEndRef} className="h-2" />
                  {isLoadingMore && (
                    <div className="flex items-center justify-center py-2">
                      <Loader2 className="h-4 w-4 animate-spin text-[#0061FF]" />
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </ScrollArea>

        {/* Comment Input */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 shrink-0 bg-background dark:bg-slate-900">
          <CommentInputField
            value={commentText}
            onChange={setCommentText}
            onSubmit={handleSendComment}
            onMediaSubmit={async (media) => {
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
  );
};
