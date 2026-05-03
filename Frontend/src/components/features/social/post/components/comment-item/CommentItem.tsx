import { useState } from "react";
import type { CommentWithReplies } from "../../hooks/use-comments";
import { CommentInputField } from "../comment-input-field";
import { CommentReplyItem } from "./CommentReplyItem";
import { CommentBase } from "./CommentBase";
import { commentService } from "@/services/comment/comment.service";
import { toast } from "sonner";

interface CommentItemProps {
  comment: CommentWithReplies;
  postId: string;
  currentUser: { id: string; fullName?: string; avatarUrl?: string | null } | null;
  postAuthorId: string;
  formatDate: (date: string) => string;
  replyingTo: string | null;
  setReplyingTo: (id: string | null) => void;
  replyText: string;
  setReplyText: (text: string) => void;
  onSendReply: (parentCommentId: string, text?: string) => void;
  onReplyClick: (replyId: string, replyAuthorName: string, replyAuthorId: string) => void;
  toggleReplies: (commentId: string) => void;
  loadReplies: (commentId: string) => Promise<void>;
  toggleNestedReplies: (replyId: string) => void;
  loadNestedReplies: (replyId: string) => Promise<void>;
  onDeleteComment: (commentId: string) => Promise<void>;
  onEditComment: (commentId: string, newContent: string) => Promise<void>;
  onCommentCountChange?: (delta: number) => void;
  onReplyCountChange?: (commentId: string, delta: number) => void;
  isPending: boolean;
}

export const CommentItem = ({
  comment,
  postId,
  currentUser,
  postAuthorId,
  formatDate,
  replyingTo,
  setReplyingTo,
  replyText,
  setReplyText,
  onSendReply,
  onReplyClick,
  toggleReplies,
  loadReplies,
  toggleNestedReplies,
  loadNestedReplies,
  onDeleteComment,
  onEditComment,
  onCommentCountChange,
  onReplyCountChange,
  isPending,
}: CommentItemProps) => {
  const [localReplyText, setLocalReplyText] = useState("");
  const isReplying = replyingTo === comment.id;
  
  const handleReplyToComment = () => {
    if (comment.authorId && comment.authorId !== currentUser?.id) {
      setLocalReplyText(`@${comment.authorName || "người dùng"} `);
    }
    setReplyingTo(comment.id);
  };
  
  const handleSendReply = () => {
    if (!localReplyText.trim()) return;
    onSendReply(comment.id, localReplyText);
    setLocalReplyText("");
    setReplyingTo(null);
  };
  
  const handleDelete = async () => {
    try {
      await onDeleteComment(comment.id);
      // Decrement total comment count for post
      onCommentCountChange?.(-1);
      toast.success("Đã xóa bình luận");
    } catch (err) {
      console.error("[DeleteComment] Error:", err);
      toast.error("Không thể xóa bình luận. Vui lòng thử lại.");
      throw err; // Re-throw for CommentBase dialog handling
    }
  };
  
  const handleEdit = async (newContent: string) => {
    await onEditComment(comment.id, newContent);
  };
  
  const handleMediaSubmit = async (media: any) => {
    if (!media) return;
    const content = localReplyText.trim() || " ";
    await commentService.createComment({
      postId,
      content,
      parentCommentId: comment.id,
      media,
    });
    setLocalReplyText("");
    setReplyingTo(null);
  };
  
  // Render replies section
  const repliesSection = comment.showReplies && comment.replies && comment.replies.length > 0 ? (
    <div className="mt-3 space-y-3">
      {comment.replies.map((reply) => (
        <CommentReplyItem
          key={reply.id}
          reply={reply}
          postId={postId}
          currentUser={currentUser}
          postAuthorId={postAuthorId}
          formatDate={formatDate}
          onSendReply={onSendReply}
          onReplyClick={onReplyClick}
          onDelete={async (replyId) => {
            await onDeleteComment(replyId);
          }}
          onEdit={async (replyId, newContent) => {
            await onEditComment(replyId, newContent);
          }}
          onReplyCountChange={(commentId, delta) => {
            onReplyCountChange?.(commentId, delta);
          }}
          onPostCommentCountChange={(delta) => {
            onCommentCountChange?.(delta);
          }}
          isPending={isPending}
          replyingTo={replyingTo}
          setReplyingTo={setReplyingTo}
          toggleNestedReplies={toggleNestedReplies}
          loadNestedReplies={loadNestedReplies}
        />
      ))}
    </div>
  ) : null;
  
  // Render reply input
  const replyInputSection = isReplying ? (
    <div className="mt-2">
      <CommentInputField
        value={localReplyText}
        onChange={setLocalReplyText}
        onSubmit={handleSendReply}
        onMediaSubmit={handleMediaSubmit}
        isPending={isPending}
        placeholder={`Phản hồi ${comment.authorName || "người dùng"}...`}
        currentUserAvatar={currentUser?.avatarUrl}
        currentUserName={currentUser?.fullName}
        autoFocus
        size="sm"
        showToolbar={true}
      />
    </div>
  ) : null;
  
  return (
    <CommentBase
      authorId={comment.authorId ?? ""}
      authorName={comment.authorName}
      authorAvatarUrl={comment.authorAvatarUrl}
      isPostAuthor={comment.authorId === postAuthorId}
      content={comment.content}
      media={comment.media}
      createdAt={comment.createdAt}
      isEdited={comment.isEdited ?? false}
      reactionCount={comment.reactionCount}
      replyCount={comment.replyCount}
      isParentDeleted={comment.isParentDeleted}
      currentUserId={currentUser?.id}
      showReplyButton={true}
      showRepliesToggle={true}
      showReplies={comment.showReplies ?? false}
      indentLevel={1}
      formatDate={formatDate}
      onReply={handleReplyToComment}
      onToggleReplies={() => toggleReplies(comment.id)}
      onDelete={handleDelete}
      onEdit={handleEdit}
      children={repliesSection}
      replyInput={replyInputSection}
    />
  );
};
