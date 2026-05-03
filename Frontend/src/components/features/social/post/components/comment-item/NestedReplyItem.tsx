import { useState } from "react";
import type { ReplyItem } from "../../hooks/use-comments";
import { CommentInputField } from "../comment-input-field";
import { CommentBase } from "./CommentBase";
import { commentService } from "@/services/comment/comment.service";
import { toast } from "sonner";

interface NestedReplyItemProps {
  reply: ReplyItem;
  postId: string;
  parentReplyId: string;
  currentUser: { id: string; fullName?: string; avatarUrl?: string | null } | null;
  postAuthorId: string;
  formatDate: (date: string) => string;
  onSendReply: (parentCommentId: string, text: string) => void;
  onDelete?: (replyId: string) => Promise<void>;
  onEdit?: (replyId: string, newContent: string) => Promise<void>;
  onReplyCountChange?: (commentId: string, delta: number) => void;
  onPostCommentCountChange?: (delta: number) => void;
  isPending: boolean;
  replyingTo: string | null;
  setReplyingTo: (id: string | null) => void;
}

export const NestedReplyItem = ({
  reply,
  postId,
  parentReplyId,
  currentUser,
  postAuthorId,
  formatDate,
  onSendReply,
  onDelete,
  onEdit,
  onPostCommentCountChange,
  isPending,
  replyingTo,
  setReplyingTo,
}: NestedReplyItemProps) => {
  const [localReplyText, setLocalReplyText] = useState("");
  const isReplying = replyingTo === reply.id;
  
  const handleReplyToLv3 = () => {
    if (reply.author.id !== currentUser?.id) {
      setLocalReplyText(`@${reply.author.fullName} `);
    }
    setReplyingTo(reply.id);
  };
  
  const handleSendLv3Reply = () => {
    if (!localReplyText.trim()) return;
    // Lv3 replies go to the parent Lv2 reply (parentReplyId)
    onSendReply(parentReplyId, localReplyText);
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
      // Lv3 is a leaf node - no children, so don't decrement its own replyCount
      // Only decrement post's total comment count
      onPostCommentCountChange?.(-1);
      toast.success("Đã xóa phản hồi");
    } catch (err) {
      console.error("[DeleteNestedReply] Error:", err);
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
  
  // Render reply input
  const replyInputSection = isReplying ? (
    <div className="mt-2">
      <CommentInputField
        value={localReplyText}
        onChange={setLocalReplyText}
        onSubmit={handleSendLv3Reply}
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
      showRepliesToggle={false}  // Lv3 has no children
      showReplies={false}
      indentLevel={3}
      formatDate={formatDate}
      onReply={handleReplyToLv3}
      onDelete={handleDelete}
      onEdit={handleEdit}
      replyInput={replyInputSection}
      status={reply.status}
    />
  );
};
