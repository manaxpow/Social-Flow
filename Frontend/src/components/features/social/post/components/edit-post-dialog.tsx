import { ImageIcon, X, Loader2, AlertCircle, Users } from "lucide-react";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MentionInput } from "@/components/common/mention-input";
import { MAX_MEDIA_COUNT } from "@/lib/zod/post/post.schema";
import type { DropzoneRootProps, DropzoneInputProps } from "react-dropzone";

export interface EditMediaItem {
  previewUrl: string;
  publicId: string | null;
  isUploading: boolean;
  isExisting: boolean;
  file?: File;
}

interface EditPostDialogProps {
  open: boolean;
  authorName: string;
  authorAvatarUrl?: string | null;
  editContent: string;
  setEditContent: (val: string) => void;
  editMediaItems: EditMediaItem[];
  mentionedUserIds: string[];
  setMentionedUserIds: (ids: string[]) => void;
  isPending: boolean;
  progress: number;
  uploadError: string | null;
  getEditRootProps: () => DropzoneRootProps;
  getEditInputProps: () => DropzoneInputProps;
  isEditDragActive: boolean;
  onRemoveMedia: (index: number) => void;
  onCancel: () => void;
  onSave: () => void;
}

/**
 * Dialog for editing an existing post's content and media attachments.
 */
export const EditPostDialog = ({
  open,
  authorName,
  authorAvatarUrl,
  editContent,
  setEditContent,
  editMediaItems,
  mentionedUserIds,
  setMentionedUserIds,
  isPending,
  progress,
  uploadError,
  getEditRootProps,
  getEditInputProps,
  isEditDragActive,
  onRemoveMedia,
  onCancel,
  onSave,
}: EditPostDialogProps) => {
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
            onClick={() => onRemoveMedia(0)}
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
              onClick={() => onRemoveMedia(idx)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) onCancel(); }}>
      <DialogContent className="sm:max-w-[680px] p-0 gap-0 max-h-[90vh] flex flex-col">
        <DialogHeader className="p-4 border-b">
          <DialogTitle className="text-center text-xl font-bold">Chỉnh sửa bài viết</DialogTitle>
        </DialogHeader>

        <div className="p-4 space-y-4 overflow-y-auto flex-1">
          <div className="flex gap-3 items-center">
            <Avatar className="h-11 w-11">
              <AvatarImage src={authorAvatarUrl ?? undefined} />
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
              onClick={onCancel}
              disabled={updatePostMutationPending(isPending)}
            >
              Hủy
            </Button>
            <Button
              className="rounded-lg bg-[#1877f2] hover:bg-[#166fe5] text-white font-bold disabled:opacity-50"
              onClick={onSave}
              disabled={
                (!editContent.trim() && editMediaItems.length === 0) ||
                isPending ||
                editMediaItems.some((m) => m.isUploading)
              }
            >
              {isPending && <Loader2 className="h-5 w-5 animate-spin mr-2" />}
              {isPending ? "Đang lưu..." : "Lưu"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const updatePostMutationPending = (isPending: boolean) => isPending;
