import { useState } from "react";
import { Globe } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Link, useNavigate } from "react-router-dom";
import { UserAvatarLink } from "@/components/common/user-link";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { PostDetailDialog } from "./post-detail-dialog";
import { PostOptionsMenu } from "./components/post-options-menu";
import { MediaGallery } from "./components/media-gallery";
import { PostCardStats } from "./components/post-card-stats";
import { PostCardActions } from "./components/post-card-actions";
import { EditPostDialog } from "./components/edit-post-dialog";
import { usePostEdit } from "@/hooks/usePostEdit";
import type { PostDetailResponse } from "@/services/post/dtos/response/post-detail.response";
import { getPostAvatar, getPostAuthorName, getPostActionText } from "@/services/post/dtos/helpers/post-helpers";
import { useAppSelector } from "@/stores/hook";
import { formatPostDate } from "@/utils/date";

interface PostCardProps {
  post: PostDetailResponse;
  onDelete: (id: string) => void;
}

const POST_TRUNCATE_LENGTH = 2000;

export const PostCard = ({ post, onDelete }: PostCardProps) => {
  const navigate = useNavigate();
  const { user: currentUser } = useAppSelector((state) => state.auth);
  const [showPostDetail, setShowPostDetail] = useState(false);
  const [selectedMediaIndex, setSelectedMediaIndex] = useState(0);
  const [isPostExpanded, setIsPostExpanded] = useState(false);

  const editState = usePostEdit(post);
  const isOwnPost = currentUser?.id === post.author.id;

  const handleImageClick = (mediaIndex: number) => {
    navigate(`/photo/${post.id}?index=${mediaIndex}`);
  };

  const handleCommentClick = () => {
    setSelectedMediaIndex(0);
    setShowPostDetail(true);
  };

  const authorName = getPostAuthorName(post);
  const actionText = getPostActionText(post.type);

  return (
    <>
      <Card className="!gap-1 !py-1 border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md transition-shadow duration-200 rounded-xl overflow-hidden bg-card">
        <CardHeader className="flex flex-row items-center justify-between !p-2.5 !pb-1.5 sm:!p-4 sm:!pb-3">
          <div className="flex items-center gap-2 sm:gap-3">
            <UserAvatarLink
              userId={post.author.id}
              avatarUrl={getPostAvatar(post)}
              name={authorName}
              className="h-9 w-9 sm:h-10 sm:w-10"
            />
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5 flex-wrap leading-tight">
                <Link
                  to={`/profile/${post.author.id}`}
                  className="font-bold hover:underline text-[14px] sm:text-[15px]"
                >
                  {authorName}
                </Link>
                {actionText && (
                  <span className="text-muted-foreground text-[13px] sm:text-[14px] font-normal">
                    {actionText}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1 text-[11px] sm:text-[12px] text-muted-foreground mt-0.5">
                <span>{formatPostDate(post.createdAt)}</span>
                <span>•</span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Globe className="h-3 w-3" />
                    </TooltipTrigger>
                    <TooltipContent>Công khai</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          </div>

          <PostOptionsMenu
            isOwnPost={isOwnPost}
            onEdit={editState.handleStartEdit}
            onDelete={() => onDelete(post.id)}
          />
        </CardHeader>

        {/* Edit Dialog */}
        <EditPostDialog
          open={editState.editOpen}
          authorName={authorName}
          authorAvatarUrl={post.author.avatarUrl}
          editContent={editState.editContent}
          setEditContent={editState.setEditContent}
          editMediaItems={editState.editMediaItems}
          mentionedUserIds={editState.mentionedUserIds}
          setMentionedUserIds={editState.setMentionedUserIds}
          isPending={editState.isPending}
          progress={editState.progress}
          uploadError={editState.uploadError}
          getEditRootProps={editState.getEditRootProps}
          getEditInputProps={editState.getEditInputProps}
          isEditDragActive={editState.isEditDragActive}
          onRemoveMedia={editState.removeEditMedia}
          onCancel={editState.handleCancelEdit}
          onSave={editState.handleSaveEdit}
        />

        <CardContent className="!p-0">
          {post.content && (
            <div className="px-3 sm:px-4 pb-2 sm:pb-3">
              <p className="text-[14px] sm:text-[15px] leading-relaxed whitespace-pre-wrap break-words">
                {isPostExpanded ? post.content : (post.content.length > POST_TRUNCATE_LENGTH ? post.content.slice(0, POST_TRUNCATE_LENGTH) + '...' : post.content)}
              </p>
              {post.content.length > POST_TRUNCATE_LENGTH && (
                <button
                  className="text-[13px] sm:text-[14px] font-semibold text-blue-600 hover:text-blue-700 mt-1"
                  onClick={() => setIsPostExpanded(!isPostExpanded)}
                >
                  {isPostExpanded ? 'Ẩn bớt' : 'Xem thêm'}
                </button>
              )}
            </div>
          )}

          {post.mediaItems && post.mediaItems.length > 0 && (
            <MediaGallery
              mediaItems={post.mediaItems}
              postType={post.type}
              onImageClick={handleImageClick}
            />
          )}

          {/* Interaction stats */}
          <PostCardStats
            post={post}
            onCommentClick={handleCommentClick}
          />

          {/* Action buttons */}
          <PostCardActions
            onCommentClick={handleCommentClick}
          />
        </CardContent>
      </Card>

      {/* Post Detail Dialog */}
      <PostDetailDialog
        open={showPostDetail}
        onOpenChange={setShowPostDetail}
        post={post}
        initialMediaIndex={selectedMediaIndex}
      />
    </>
  );
};

