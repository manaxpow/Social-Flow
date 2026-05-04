import { useState } from "react";
import {
  MoreHorizontal,
  Trash2,
  Globe,
  Heart,
  Share2,
  MessageCircle,
  ImageIcon,
  Pencil,
  X,
  Loader2,
  AlertCircle,
  Users,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { UserAvatarLink } from "@/components/common/user-link";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PostDetailDialog } from "./post-detail-dialog";
import { PhotoDialog } from "./photo-dialog";
import { MentionInput } from "@/components/common/mention-input";
import type { PostDetailResponse } from "@/services/post/dtos/response/post-detail.response";
import type { PostMediaDto } from "@/services/post/dtos/shared/post-media.dto";
import { getPostAvatar, getPostAuthorName } from "@/services/post/dtos/helpers/post-helpers";
import { postService } from "@/services/post/post.service";
import { useAppSelector } from "@/stores/hook";
import { useUpload } from "@/hooks/useUpload";
import { MAX_MEDIA_COUNT } from "@/lib/zod/post/post.schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import "dayjs/locale/vi";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(relativeTime);
dayjs.locale("vi");

// Media gallery with click handling
interface MediaGalleryProps {
  mediaItems: PostMediaDto[];
  post: PostDetailResponse;
  onImageClick: (mediaIndex: number) => void;
}

const MediaGallery = ({ mediaItems, onImageClick }: MediaGalleryProps) => {
  if (!mediaItems || mediaItems.length === 0) return null;

  if (mediaItems.length === 1) {
    return (
      <div 
        className="bg-slate-50 flex justify-center border-y border-slate-100 overflow-hidden cursor-pointer"
        onClick={() => onImageClick(0)}
      >
        <img
          src={mediaItems[0].url}
          alt="Ảnh bài viết"
          className="max-w-full h-auto object-contain max-h-[600px] hover:opacity-95 transition-opacity"
        />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-[2px] border-y border-slate-100 bg-slate-100">
      {mediaItems.map((media, idx) => (
        <div 
          key={media.id} 
          className="relative overflow-hidden cursor-pointer"
          onClick={() => onImageClick(idx)}
        >
          <img
            src={media.url}
            alt={`Ảnh ${idx + 1}`}
            className="w-full h-[250px] object-cover hover:opacity-95 transition-opacity"
          />
        </div>
      ))}
    </div>
  );
};

// Edit media item
interface EditMediaItem {
  previewUrl: string;
  publicId: string | null;
  isUploading: boolean;
  isExisting: boolean;
  file?: File;
}

interface PostCardProps {
  post: PostDetailResponse;
  onDelete: (id: string) => void;
}

const POST_TRUNCATE_LENGTH = 2000;

export const PostCard = ({ post, onDelete }: PostCardProps) => {
  const { user: currentUser } = useAppSelector((state) => state.auth);
  const queryClient = useQueryClient();
  const [editOpen, setEditOpen] = useState(false);
  const [editContent, setEditContent] = useState(post.content ?? "");
  const [editMediaItems, setEditMediaItems] = useState<EditMediaItem[]>([]);
  const [mentionedUserIds, setMentionedUserIds] = useState<string[]>([]);
  const [showPostDetail, setShowPostDetail] = useState(false);
  const [showPhotoDetail, setShowPhotoDetail] = useState(false);
  const [selectedMediaIndex, setSelectedMediaIndex] = useState(0);
  const [isPostExpanded, setIsPostExpanded] = useState(false);

  const { uploadToCloud, deleteFromCloud, isUploading, progress, error: uploadError } = useUpload();

  const isOwnPost = currentUser?.id === post.author.id;

  const formatPostDate = (date: string) => {
    return dayjs.utc(date).tz("Asia/Ho_Chi_Minh").fromNow();
  };

  const handleImageClick = (mediaIndex: number) => {
    setSelectedMediaIndex(mediaIndex);
    setShowPhotoDetail(true);
  };

  const updatePostMutation = useMutation({
    mutationFn: async (params: {
      content: string;
      media?: Array<{ url: string; publicId: string; type: string; sortOrder: number }>;
      mentionedUserIds: string[];
    }) => {
      const result = await postService.updatePost({
        id: post.id,
        content: params.content,
        media: params.media,
        mentionedUserIds: params.mentionedUserIds,
      });
      if (!result.isSuccess) {
        throw new Error(String(result.error?.message || "Cập nhật thất bại"));
      }
      return result;
    },
    onSuccess: () => {
      setEditOpen(false);
      setEditMediaItems([]);
      setMentionedUserIds([]);
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["post", post.id] });
      toast.success("Bài viết đã được cập nhật.");
    },
    onError: () => {
      toast.error("Không thể cập nhật bài viết. Vui lòng thử lại.");
    },
  });

  const onEditDrop = async (acceptedFiles: File[]) => {
    const remaining = MAX_MEDIA_COUNT - editMediaItems.length;
    const filesToAdd = acceptedFiles.slice(0, remaining);
    if (filesToAdd.length === 0) return;

    const newItems: EditMediaItem[] = filesToAdd.map((file) => ({
      file,
      previewUrl: URL.createObjectURL(file),
      publicId: null,
      isUploading: true,
      isExisting: false,
    }));

    setEditMediaItems((prev) => [...prev, ...newItems]);

    for (let i = 0; i < filesToAdd.length; i++) {
      const file = filesToAdd[i];
      try {
        const result = await uploadToCloud(file);
        setEditMediaItems((prev) =>
          prev.map((item, idx) => {
            const targetIdx = prev.length - filesToAdd.length + i;
            if (idx === targetIdx) {
              return {
                ...item,
                publicId: result.public_id,
                previewUrl: result.secure_url,
                isUploading: false,
              };
            }
            return item;
          })
        );
      } catch (error) {
        console.error("Upload failed:", error);
        setEditMediaItems((prev) => {
          const targetIdx = prev.length - filesToAdd.length + i;
          return prev.filter((_, idx) => idx !== targetIdx);
        });
      }
    }
  };

  const { getRootProps: getEditRootProps, getInputProps: getEditInputProps, isDragActive: isEditDragActive } = useDropzone({
    onDrop: onEditDrop,
    accept: { "image/*": [] },
    multiple: true,
    disabled: isUploading || editMediaItems.length >= MAX_MEDIA_COUNT,
  });

  const removeEditMedia = (index: number) => {
    setEditMediaItems((prev) => {
      const item = prev[index];
      if (item.previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(item.previewUrl);
      }
      if (!item.isExisting && item.publicId) {
        deleteFromCloud(item.publicId);
      }
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleStartEdit = () => {
    setEditContent(post.content ?? "");
    setEditMediaItems(
      post.mediaItems.map((m) => ({
        previewUrl: m.url,
        publicId: m.publicId ?? null,
        isUploading: false,
        isExisting: true,
      }))
    );
    setMentionedUserIds(post.mentions?.map((m) => m.userId) ?? []);
    setEditOpen(true);
  };

  const handleCancelEdit = () => {
    editMediaItems.forEach((item) => {
      if (!item.isExisting) {
        if (item.previewUrl.startsWith("blob:")) {
          URL.revokeObjectURL(item.previewUrl);
        }
        if (item.publicId) {
          deleteFromCloud(item.publicId);
        }
      }
    });
    setEditOpen(false);
    setEditMediaItems([]);
  };

  const handleSaveEdit = () => {
    const trimmed = editContent.trim();
    if ((!trimmed && editMediaItems.length === 0) || updatePostMutation.isPending) return;

    const hasUploadingItems = editMediaItems.some((m) => m.isUploading);
    if (hasUploadingItems) return;

    // Only send media if user changed it (added/removed items)
    const originalCount = post.mediaItems?.length ?? 0;
    const mediaChanged =
      editMediaItems.length !== originalCount ||
      editMediaItems.some((m, i) => m.previewUrl !== (post.mediaItems[i]?.url ?? ""));

    const mediaPayload = mediaChanged
      ? editMediaItems.map((m, i) => ({
          url: m.previewUrl,
          publicId: m.publicId ?? "",
          type: "Image",
          sortOrder: i,
        }))
      : undefined;

    updatePostMutation.mutate({
      content: trimmed,
      media: mediaPayload,
      mentionedUserIds,
    });
  };

  const authorName = getPostAuthorName(post);

  // Simple edit media grid
  const renderEditMediaGrid = () => {
    if (editMediaItems.length === 0) return null;

    if (editMediaItems.length === 1) {
      return (
        <div className="relative rounded-lg overflow-hidden border">
          {editMediaItems[0].isUploading && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
              <div className="text-center text-white">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                <p className="text-sm">Đang tải lên... {progress}%</p>
              </div>
            </div>
          )}
          <img
            src={editMediaItems[0].previewUrl}
            alt="Preview"
            className="w-full object-cover max-h-[300px]"
          />
          <Button
            type="button"
            variant="secondary"
            size="icon"
            className="absolute top-2 right-2 rounded-full h-8 w-8 shadow-md z-10"
            onClick={() => removeEditMedia(0)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-2 gap-1 rounded-lg overflow-hidden border">
        {editMediaItems.map((item, idx) => (
          <div key={idx} className="relative">
            {item.isUploading && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
                <Loader2 className="h-6 w-6 animate-spin text-white" />
              </div>
            )}
            <img
              src={item.previewUrl}
              alt={`Preview ${idx + 1}`}
              className="w-full h-[150px] object-cover"
            />
            <Button
              type="button"
              variant="secondary"
              size="icon"
              className="absolute top-1 right-1 rounded-full h-7 w-7 shadow-md z-10"
              onClick={() => removeEditMedia(idx)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    );
  };

  return (
    <>
      <Card className="border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow duration-200 md:rounded-xl overflow-hidden bg-background">
        <CardHeader className="flex flex-row items-center justify-between p-4 pb-3">
          <div className="flex items-center gap-3">
            <UserAvatarLink
              userId={post.author.id}
              avatarUrl={getPostAvatar(post)}
              name={authorName}
              className="h-10 w-10 ring-1 ring-slate-100"
            />
            <div className="flex flex-col">
              <Link
                to={`/profile/${post.author.id}`}
                className="font-bold hover:underline text-[15px] leading-tight"
              >
                {authorName}
              </Link>
              <div className="flex items-center gap-1 text-[12px] text-muted-foreground mt-0.5">
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

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 hover:bg-slate-100">
                <MoreHorizontal className="h-5 w-5 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 rounded-xl shadow-lg border-slate-200">
              {isOwnPost && (
                <DropdownMenuItem
                  className="cursor-pointer font-semibold py-2.5 focus:bg-blue-50 focus:text-blue-600"
                  onClick={handleStartEdit}
                >
                  <Pencil className="mr-3 h-4 w-4" /> Chỉnh sửa bài viết
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                className="text-destructive cursor-pointer font-semibold py-2.5 focus:bg-red-50 focus:text-destructive"
                onClick={() => onDelete(post.id)}
              >
                <Trash2 className="mr-3 h-4 w-4" /> Xóa bài viết
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardHeader>

        {/* Edit Dialog */}
        <Dialog open={editOpen} onOpenChange={(isOpen) => { if (!isOpen) handleCancelEdit(); }}>
          <DialogContent className="sm:max-w-[680px] p-0 gap-0 max-h-[90vh] flex flex-col">
            <DialogHeader className="p-4 border-b">
              <DialogTitle className="text-center text-xl font-bold">Chỉnh sửa bài viết</DialogTitle>
            </DialogHeader>

            <div className="p-4 space-y-4 overflow-y-auto flex-1">
              <div className="flex gap-3 items-center">
                <Avatar className="h-11 w-11">
                  <AvatarImage src={post.author.avatarUrl ?? undefined} />
                </Avatar>
                <div>
                  <p className="font-bold text-[15px]">{authorName}</p>
                  <div className="flex items-center gap-1 bg-[#e4e6eb] px-2 py-0.5 rounded-md w-fit mt-0.5 text-[12px] font-semibold">
                    <Users className="h-3 w-3" /> Bạn bè
                  </div>
                </div>
              </div>

              <MentionInput
                value={editContent}
                onChange={setEditContent}
                placeholder="Bạn đang nghĩ gì?"
                className="border-none focus-visible:ring-0 text-xl md:text-2xl resize-none p-0 min-h-[200px] placeholder:text-muted-foreground/60 shadow-none"
                mentionedUserIds={mentionedUserIds}
                setMentionedUserIds={setMentionedUserIds}
              />

              {/* Media Section */}
              <div className="relative border rounded-lg p-2 group">
                {renderEditMediaGrid()}

                {editMediaItems.length > 0 && editMediaItems.length < MAX_MEDIA_COUNT && (
                  <div
                    {...getEditRootProps()}
                    className="mt-2 flex items-center justify-center gap-2 py-2 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors text-muted-foreground text-sm"
                  >
                    <input {...getEditInputProps()} />
                    <ImageIcon className="h-4 w-4" />
                    <span>Thêm ảnh ({editMediaItems.length}/{MAX_MEDIA_COUNT})</span>
                  </div>
                )}

                {editMediaItems.length === 0 && (
                  <div
                    {...getEditRootProps()}
                    className={`flex flex-col items-center justify-center min-h-[180px] bg-[#f7f8fa] hover:bg-[#ecedf0] rounded-lg cursor-pointer transition-colors border-2 border-dashed ${
                      isEditDragActive ? "border-primary bg-primary/5" : "border-transparent"
                    }`}
                  >
                    <input {...getEditInputProps()} />
                    <div className="bg-[#e4e6eb] p-3 rounded-full mb-2">
                      <ImageIcon className="h-6 w-6" />
                    </div>
                    <p className="font-bold text-[17px]">Thêm ảnh</p>
                    <p className="text-xs text-muted-foreground">hoặc kéo và thả (tối đa {MAX_MEDIA_COUNT} ảnh)</p>
                  </div>
                )}

                {uploadError && (
                  <div className="flex items-center gap-2 text-destructive text-sm mt-2">
                    <AlertCircle className="h-4 w-4" />
                    <span>{uploadError}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  variant="ghost"
                  className="rounded-lg text-muted-foreground"
                  onClick={handleCancelEdit}
                  disabled={updatePostMutation.isPending}
                >
                  Hủy
                </Button>
                <Button
                  className="rounded-lg bg-[#1877f2] hover:bg-[#166fe5] text-white font-bold disabled:opacity-50"
                  onClick={handleSaveEdit}
                  disabled={
                    (!editContent.trim() && editMediaItems.length === 0) ||
                    updatePostMutation.isPending ||
                    editMediaItems.some((m) => m.isUploading)
                  }
                >
                  {updatePostMutation.isPending && <Loader2 className="h-5 w-5 animate-spin mr-2" />}
                  {updatePostMutation.isPending ? "Đang lưu..." : "Lưu"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <CardContent className="p-0">
          {post.content && (
            <div className="px-4 pb-3">
              <p className="text-[15px] leading-relaxed whitespace-pre-wrap break-words">
                {isPostExpanded ? post.content : (post.content.length > POST_TRUNCATE_LENGTH ? post.content.slice(0, POST_TRUNCATE_LENGTH) + '...' : post.content)}
              </p>
              {post.content.length > POST_TRUNCATE_LENGTH && (
                <button
                  className="text-[14px] font-semibold text-blue-600 hover:text-blue-700 mt-1"
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
              post={post}
              onImageClick={handleImageClick}
            />
          )}

          {/* Interaction stats */}
          <div className="px-4 py-2.5 flex justify-between text-muted-foreground text-[14px]">
            <div className="flex items-center gap-1.5 hover:underline cursor-pointer">
              <Heart className="h-4 w-4 fill-red-500 text-red-500" />
              <span>{post.reactionCount || 0}</span>
            </div>
            <div className="flex gap-3 text-muted-foreground/80">
              <span 
                className="hover:underline cursor-pointer" 
                onClick={() => {
                  setSelectedMediaIndex(0);
                  setShowPostDetail(true);
                }}
              >
                {post.commentCount || 0} bình luận
              </span>
              <span className="hover:underline cursor-pointer">
                {post.shareCount || 0} lượt chia sẻ
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-around p-1 mx-3 border-t border-slate-100">
            <Button variant="ghost" className="flex-1 font-semibold text-muted-foreground hover:bg-slate-100 h-9 rounded-md gap-2">
              <Heart className="h-5 w-5" />
              <span>Thích</span>
            </Button>
            <Button
              variant="ghost"
              className="flex-1 font-semibold text-muted-foreground hover:bg-slate-100 h-9 rounded-md gap-2"
              onClick={() => {
                setSelectedMediaIndex(0);
                setShowPostDetail(true);
              }}
            >
              <MessageCircle className="h-5 w-5" />
              <span>Bình luận</span>
            </Button>
            <Button variant="ghost" className="flex-1 font-semibold text-muted-foreground hover:bg-slate-100 h-9 rounded-md gap-2">
              <Share2 className="h-5 w-5" />
              <span>Chia sẻ</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Post Detail Dialog - Single Column */}
      <PostDetailDialog
        open={showPostDetail}
        onOpenChange={setShowPostDetail}
        post={post}
        initialMediaIndex={selectedMediaIndex}
      />

      {/* Photo Dialog - 75/25 Split */}
      <PhotoDialog
        open={showPhotoDetail}
        onOpenChange={setShowPhotoDetail}
        post={post}
        initialMediaIndex={selectedMediaIndex}
      />
    </>
  );
};
