import { useState } from "react";
import { Link } from "react-router-dom";
import { Heart, ChevronDown, ChevronUp, Pencil, Trash2, MoreHorizontal, FileText, Download, Loader2, AlertCircle } from "lucide-react";
import { UserAvatarLink } from "@/components/common/user-link";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import type { CommentStatus } from "../../hooks/use-comments";

export interface CommentBaseProps {
  // Author info
  authorId: string;
  authorName?: string;
  authorAvatarUrl?: string | null;
  isPostAuthor: boolean;
  
  // Content
  content: string;
  media?: { url: string; type: string | number; publicId?: string } | null;
  
  // Metadata
  createdAt: string;
  isEdited: boolean;
  reactionCount: number;
  replyCount?: number;
  
  // Parent deleted flag
  isParentDeleted?: boolean;
  
  // Current user
  currentUserId?: string;
  
  // Display settings
  showReplyButton: boolean;
  showRepliesToggle: boolean;
  showReplies: boolean;
  indentLevel: 1 | 2 | 3;
  
  // Callbacks
  formatDate: (date: string) => string;
  onLike?: () => void;
  onReply?: () => void;
  onToggleReplies?: () => void;
  onDelete: () => Promise<void>;
  onEdit: (newContent: string) => Promise<void>;
  
  // Children (for container components to render their specific children)
  children?: React.ReactNode;
  replyInput?: React.ReactNode;
  
  // Status for optimistic updates (NEW)
  status?: CommentStatus;
  onRetry?: () => void;
}

const CONTENT_TRUNCATE_LENGTH = 500;

export const CommentBase = ({
  authorId,
  authorName,
  authorAvatarUrl,
  isPostAuthor,
  content,
  media,
  createdAt,
  isEdited,
  reactionCount,
  replyCount,
  isParentDeleted,
  currentUserId,
  showReplyButton,
  showRepliesToggle,
  showReplies,
  indentLevel,
  formatDate,
  onLike,
  onReply,
  onToggleReplies,
  onDelete,
  onEdit,
  children,
  replyInput,
  status,
  onRetry: _onRetry,
}: CommentBaseProps) => {
  // Determine status-based styling
  const isPending = status === 'pending';
  const isError = status === 'error';
  const showDimmed = isPending || isError;
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(content);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  
  const isOwner = currentUserId === authorId;
  
  // Size classes based on indent level
  const avatarSize = indentLevel === 1 ? "h-10 w-10" : indentLevel === 2 ? "h-10 w-10" : "h-8 w-8";
  const paddingClass = indentLevel === 1 ? "px-4 py-2.5" : indentLevel === 2 ? "px-4 py-2.5" : "px-3 py-2";
  const fontSize = indentLevel === 1 ? "text-[16px]" : indentLevel === 2 ? "text-[16px]" : "text-[14px]";
  const actionFontSize = indentLevel === 1 ? "text-[12px]" : indentLevel === 2 ? "text-[12px]" : "text-[11px]";
  const gapClass = indentLevel === 3 ? "gap-3" : "gap-3";
  
  const truncateContent = (text: string) => {
    if (text.length <= CONTENT_TRUNCATE_LENGTH) return text;
    return isExpanded ? text : text.slice(0, CONTENT_TRUNCATE_LENGTH) + "...";
  };
  
  const handleStartEdit = () => {
    setEditText(content);
    setIsEditing(true);
  };
  
  const handleSaveEdit = async () => {
    if (!editText.trim() || editText === content) {
      setIsEditing(false);
      return;
    }
    try {
      await onEdit(editText.trim());
      setIsEditing(false);
    } catch {
      // Error handled by container
    }
  };
  
  const handleCancelEdit = () => {
    setEditText(content);
    setIsEditing(false);
  };
  
  const handleDelete = async () => {
    try {
      await onDelete();
      setDeleteDialogOpen(false);
    } catch {
      // Error handled by container
    }
  };
  
  const handleLike = () => {
    setIsLiked(!isLiked);
    onLike?.();
  };
  
  return (
    <div className="space-y-3">
      {/* Parent deleted notice - moved to top */}
      {isParentDeleted && (
        <p className="text-[12px] ml-4 italic text-muted-foreground pl-0">
          Bình luận được phản hồi đã bị xóa
        </p>
      )}
      <div className="flex gap-3">
        <UserAvatarLink
          userId={authorId}
          avatarUrl={authorAvatarUrl}
          name={authorName}
          className={`${avatarSize} shrink-0`}
        />
        <div className="flex-1 min-w-0">
          <div className={`bg-slate-100 dark:bg-slate-800 rounded-2xl ${paddingClass} inline-block`}>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 flex-wrap">
                <Link
                  to={`/profile/${authorId}`}
                  className={`font-semibold ${fontSize} hover:underline`}
                >
                  {authorName}
                </Link>
                {isPostAuthor && (
                  <span className="text-[11px] bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400 px-1.5 py-0.5 rounded font-medium">
                    Tác giả
                  </span>
                )}
              </div>
              {isOwner && !isEditing && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded">
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={handleStartEdit} className="cursor-pointer">
                      <Pencil className="h-4 w-4 mr-2" />
                      Sửa
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setDeleteDialogOpen(true)} className="cursor-pointer text-red-500">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Xóa
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
            {isEditing ? (
              <div className="mt-2 space-y-2">
                <textarea
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 resize-none"
                  rows={3}
                  autoFocus
                />
                <div className="flex items-center gap-2">
                  <Button size="sm" onClick={handleSaveEdit} disabled={!editText.trim()}>
                    <Pencil className="h-4 w-4 mr-1" />
                    Lưu
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                    Hủy
                  </Button>
                </div>
              </div>
            ) : (
              <>
                {isEdited && (
                  <p className="text-[13px] italic text-muted-foreground mt-1">
                    Đã chỉnh sửa
                  </p>
                )}
                {/* Status indicators for optimistic updates */}
                {isPending && (
                  <div className="flex items-center gap-2 mt-1">
                    <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                    <span className="text-[12px] text-blue-500">Đang gửi...</span>
                  </div>
                )}
                {isError && (
                  <div className="flex items-center gap-2 mt-1">
                    <AlertCircle className="h-4 w-4 text-red-500" />
                    <span className="text-[12px] text-red-500">Gửi thất bại</span>
                  </div>
                )}
                <p className={`${fontSize} leading-relaxed break-words ${showDimmed ? 'opacity-50' : ''}`}>
                  {truncateContent(content)}
                </p>
              </>
            )}
            {!isEditing && content.length > CONTENT_TRUNCATE_LENGTH && (
              <button
                className="text-[12px] font-semibold text-blue-600 hover:text-blue-700"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {isExpanded ? "Ẩn bớt" : "Xem thêm"}
              </button>
            )}
            
            {/* Media Display */}
            {media && media.url && (
              <div className="mt-2">
                {media.type === "image" || media.type === 1 ? (
                  <img
                    src={media.url}
                    alt="Attachment"
                    className="max-w-[300px] max-h-[200px] rounded-lg object-cover cursor-pointer hover:opacity-90"
                    onClick={() => window.open(media.url, "_blank")}
                  />
                ) : media.type === "video" || media.type === 2 ? (
                  <video
                    src={media.url}
                    controls
                    className="max-w-[300px] max-h-[200px] rounded-lg"
                  />
                ) : (
                  <a
                    href={media.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    download
                    className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors max-w-[300px]"
                  >
                    <div className="flex-shrink-0 w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                      <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {media.publicId?.split('/').pop() || "File đính kèm"}
                      </p>
                      <p className="text-xs text-muted-foreground">Nhấn để tải xuống</p>
                    </div>
                    <Download className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                  </a>
                )}
              </div>
            )}
          </div>
          
          <div className={`flex items-center ${gapClass} mt-1.5 px-2 ${actionFontSize} text-muted-foreground`}>
            <span>{formatDate(createdAt)}</span>
            <button
              className={`font-semibold hover:underline flex items-center gap-1 cursor-pointer ${
                isLiked ? "text-blue-600" : ""
              }`}
              onClick={handleLike}
            >
              <Heart className={`h-3.5 w-3.5 ${isLiked ? "fill-current" : ""}`} />
              {reactionCount > 0 && reactionCount}
            </button>
            {showReplyButton && (
              <button
                className="font-semibold hover:underline cursor-pointer"
                onClick={onReply}
              >
                Phản hồi
              </button>
            )}
            {showRepliesToggle && (replyCount ?? 0) > 0 && (
              <button
                className="font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                onClick={onToggleReplies}
              >
                {showReplies ? (
                  <>
                    <ChevronUp className="h-3.5 w-3.5" />
                    Ẩn
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-3.5 w-3.5" />
                    {replyCount} phản hồi
                  </>
                )}
              </button>
            )}
          </div>
          
          {/* Children (nested replies) */}
          {children}
          
          {/* Reply Input */}
          {replyInput}
          
          {/* Delete Confirmation Dialog */}
          <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Xóa bình luận</AlertDialogTitle>
                <AlertDialogDescription>
                  Bạn có chắc chắn muốn xóa bình luận này không? Hành động này không thể hoàn tác.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setDeleteDialogOpen(false)}>
                  Hủy
                </AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600">
                  Xóa
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
};
