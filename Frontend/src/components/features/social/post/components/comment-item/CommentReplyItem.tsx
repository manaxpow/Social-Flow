import { useState } from "react";
import type { ReplyItem } from "../../hooks/use-comments";
import { CommentInputField } from "../comment-input-field";
import { NestedReplyItem } from "./NestedReplyItem";
import { CommentBase } from "./CommentBase";
import { commentService } from "@/services/comment/comment.service";
import { toast } from "sonner";

interface CommentReplyItemProps {
  reply: ReplyItem;
  postId: string;
  currentUser: { id: string; fullName?: string; avatarUrl?: string | null } | null;
  postAuthorId: string;
  formatDate: (date: string) => string;
  onSendReply: (parentCommentId: string, text: string) => void;
  onReplyClick?: (replyId: string, replyAuthorName: string, replyAuthorId: string) => void;
  onDelete?: (replyId: string) => Promise<void>;
  onEdit?: (replyId: string, newContent: string) => Promise<void>;
  onReplyCountChange?: (commentId: string, delta: number) => void;
  onPostCommentCountChange?: (delta: number) => void;
  isPending: boolean;
  replyingTo: string | null;
  setReplyingTo: (id: string | null) => void;
  toggleNestedReplies?: (replyId: string) => void;
  loadNestedReplies?: (replyId: string) => Promise<void>;
}

export const CommentReplyItem = ({
  reply,
  postId,
  currentUser,
  postAuthorId,
  formatDate,
  onSendReply,
  onReplyClick,
  onDelete,
  onEdit,
  onReplyCountChange,
  onPostCommentCountChange,
  isPending,
  replyingTo,
  setReplyingTo,
  toggleNestedReplies,
  loadNestedReplies,
}: CommentReplyItemProps) => {
  const [localReplyText, setLocalReplyText] = useState("");
  const isReplying = replyingTo === reply.id;
  
  const handleReplyToReply = () => {
    if (onReplyClick) {
      onReplyClick(reply.id, reply.author.fullName, reply.author.id);
    } else {
      if (reply.author.id !== currentUser?.id) {
        setLocalReplyText(`@${reply.author.fullName} `);
      }
      setReplyingTo(reply.id);
    }
  };
  
  const handleSendLv2Reply = () => {
    if (!localReplyText.trim()) return;
    onSendReply(reply.id, localReplyText);
    setLocalReplyText("");
    setReplyingTo(null);
  };
  
  const handleDelete = async () => {
    try {
      if (onDelete) {
        await onDelete(reply.id);
      } else {
        await commentService.deleteComment(reply.id);
      }
      // Decrement parent Lv1 comment's reply count
      onReplyCountChange?.(reply.id, -1);
      // Decrement post's total comment count
      onPostCommentCountChange?.(-1);
      toast.success("Đã xóa phản hồi");
    } catch (err) {
      console.error("[DeleteReply] Error:", err);
      toast.error("Không thể xóa phản hồi. Vui lòng thử lại.");
      throw err;
    }
  };
  
  const handleEdit = async (newContent: string) => {
    if (onEdit) {
      await onEdit(reply.id, newContent);
    } else {
      await commentService.updateComment(reply.id, newContent);
    }
  };
  
  const handleMediaSubmit = async (media: any) => {
    if (!media) return;
    const content = localReplyText.trim() || " ";
    await commentService.createComment({
      postId,
      content,
      parentCommentId: reply.id,
      media,
    });
    setLocalReplyText("");
    setReplyingTo(null);
  };
  
  // Render nested replies section (Lv3)
  const nestedRepliesSection = reply.showReplies && reply.nestedReplies && reply.nestedReplies.length > 0 ? (
    <div className="mt-3 ml-2 space-y-3">
      {reply.nestedReplies.map((nestedReply) => (
        <NestedReplyItem
          key={nestedReply.id}
          reply={nestedReply}
          postId={postId}
          parentReplyId={reply.id}
          currentUser={currentUser}
          postAuthorId={postAuthorId}
          formatDate={formatDate}
          onSendReply={onSendReply}
          onDelete={onDelete}
          onEdit={onEdit}
          onReplyCountChange={onReplyCountChange}
          onPostCommentCountChange={onPostCommentCountChange}
          isPending={isPending}
          replyingTo={replyingTo}
          setReplyingTo={setReplyingTo}
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
        onSubmit={handleSendLv2Reply}
        onMediaSubmit={handleMediaSubmit}
        isPending={isPending}
        placeholder={`Phản hồi ${reply.author.fullName}...`}
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
      authorId={reply.author.id}
      authorName={reply.author.fullName}
      authorAvatarUrl={reply.author.avatarUrl}
      isPostAuthor={reply.author.id === postAuthorId}
      content={reply.content}
      media={reply.media}
      createdAt={reply.createdAt}
      isEdited={reply.isEdited ?? false}
      reactionCount={reply.reactionsCount}
      replyCount={reply.replyCount}
      isParentDeleted={reply.isParentDeleted}
      currentUserId={currentUser?.id}
      showReplyButton={true}
      showRepliesToggle={true}
      showReplies={reply.showReplies ?? false}
      indentLevel={2}
      formatDate={formatDate}
      onReply={handleReplyToReply}
      onToggleReplies={() => toggleNestedReplies?.(reply.id)}
      onDelete={handleDelete}
      onEdit={handleEdit}
      children={nestedRepliesSection}
      replyInput={replyInputSection}
      status={reply.status}
    />
  );
};
