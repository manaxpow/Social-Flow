import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ImageIcon, X, Loader2, AlertCircle, Users } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { useAppSelector } from "@/stores/hook";
import { useUpload } from "@/hooks/useUpload";
import { useDraftPost } from "@/hooks/useDraftPost";
import type { DraftMediaItem } from "@/hooks/useDraftPost";
import { useCreatePost } from "@/hooks/queries/useProfileQueries";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MentionInput } from "@/components/common/mention-input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { createPostSchema, MAX_MEDIA_COUNT, type CreatePostValues } from "@/lib/zod/post/post.schema";

interface UploadedMedia {
  file?: File;
  previewUrl: string;
  publicId: string | null;
  isUploading: boolean;
}

export const CreatePostCard = () => {
  const { user } = useAppSelector((state) => state.auth);
  const [open, setOpen] = useState(false);
  const [mediaItems, setMediaItems] = useState<UploadedMedia[]>([]);
  const [mentionedUserIds, setMentionedUserIds] = useState<string[]>([]);

  const { uploadToCloud, deleteFromCloud, isUploading, progress, error: uploadError } = useUpload();
  const { draft, updateContent, setMediaItems: setDraftMediaItems, clearDraft, hasDraft } = useDraftPost();
  const createPost = useCreatePost();

  const {
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CreatePostValues>({
    resolver: zodResolver(createPostSchema),
    defaultValues: { content: draft.content },
  });

  const contentValue = watch("content");

  // Ref to prevent circular updates between restore and auto-save
  const isRestoringRef = useRef(false);

  // Restore draft when dialog opens (only on open transition)
  useEffect(() => {
    if (open && hasDraft) {
      isRestoringRef.current = true;
      setValue("content", draft.content);
      if (draft.mediaItems.length > 0) {
        setMediaItems(
          draft.mediaItems.map((item) => ({
            previewUrl: item.url,
            publicId: item.publicId,
            isUploading: false,
          }))
        );
      }
      // Reset flag after restore completes
      requestAnimationFrame(() => {
        isRestoringRef.current = false;
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Clear on dialog close
  useEffect(() => {
    if (!open) {
      reset();
      setMediaItems([]);
    }
  }, [open, reset]);

  // Auto-save draft (skip during restore to prevent infinite loop)
  useEffect(() => {
    if (isRestoringRef.current) return;
    if (contentValue || mediaItems.length > 0) {
      updateContent(contentValue);
      const draftItems: DraftMediaItem[] = mediaItems
        .filter((m) => m.publicId)
        .map((m) => ({ url: m.previewUrl, publicId: m.publicId! }));
      setDraftMediaItems(draftItems);
    }
  }, [contentValue, mediaItems, updateContent, setDraftMediaItems]);

  const onDrop = async (acceptedFiles: File[]) => {
    const remaining = MAX_MEDIA_COUNT - mediaItems.length;
    const filesToAdd = acceptedFiles.slice(0, remaining);
    if (filesToAdd.length === 0) return;

    // Add items with local preview immediately
    const newItems: UploadedMedia[] = filesToAdd.map((file) => ({
      file,
      previewUrl: URL.createObjectURL(file),
      publicId: null,
      isUploading: true,
    }));

    setMediaItems((prev) => [...prev, ...newItems]);

    // Upload each file
    for (let i = 0; i < filesToAdd.length; i++) {
      const file = filesToAdd[i];
      try {
        const result = await uploadToCloud(file);
        setMediaItems((prev) =>
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
        // Remove failed item
        setMediaItems((prev) => {
          const targetIdx = prev.length - filesToAdd.length + i;
          return prev.filter((_, idx) => idx !== targetIdx);
        });
      }
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    multiple: true,
    disabled: isUploading || mediaItems.length >= MAX_MEDIA_COUNT,
  });

  const removeMedia = (index: number) => {
    setMediaItems((prev) => {
      const item = prev[index];
      if (item.previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(item.previewUrl);
      }
      // Delete from Cloudinary if the image was already uploaded
      if (item.publicId) {
        deleteFromCloud(item.publicId);
      }
      return prev.filter((_, i) => i !== index);
    });
  };

  const onSubmit = async (values: CreatePostValues) => {
    if (!user?.id) return;

    // Check all uploads are done
    const allUploaded = mediaItems.every((m) => m.publicId);
    if (!allUploaded) return;

    try {
      const mediaPayload =
        mediaItems.length > 0
          ? mediaItems.map((m, i) => ({
              url: m.previewUrl,
              publicId: m.publicId!,
              type: "Image",
              sortOrder: i,
            }))
          : undefined;

      await createPost.mutateAsync({
        content: values.content,
        media: mediaPayload,
        userId: user.id,
        mentionedUserIds,
      });

      clearDraft();
      handleClose(false);
      setMentionedUserIds([]);
    } catch (error) {
      console.error("Create post failed:", error);
    }
  };

  const handleClose = (deleteOrphans: boolean = true) => {
    setOpen(false);
    reset();
    // Revoke blob URLs
    mediaItems.forEach((item) => {
      if (item.previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(item.previewUrl);
      }
    });
    // Delete orphaned uploaded images from Cloudinary (only when NOT submitting a post)
    if (deleteOrphans) {
      mediaItems.forEach((item) => {
        if (item.publicId) {
          deleteFromCloud(item.publicId);
        }
      });
    }
    setMediaItems([]);
  };

  const hasUploadingItems = mediaItems.some((m) => m.isUploading);
  const canSubmit = (contentValue?.trim().length > 0 || mediaItems.length > 0) && !hasUploadingItems;

  // Simple media preview grid
  const renderMediaGrid = () => {
    if (mediaItems.length === 0) return null;

    if (mediaItems.length === 1) {
      return (
        <div className="relative rounded-lg overflow-hidden border">
          {mediaItems[0].isUploading && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
              <div className="text-center text-white">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                <p className="text-sm">Đang tải lên... {progress}%</p>
              </div>
            </div>
          )}
          <img
            src={mediaItems[0].previewUrl}
            alt="Preview"
            className="w-full object-cover max-h-[300px]"
          />
          <Button
            type="button"
            variant="secondary"
            size="icon"
            className="absolute top-2 right-2 rounded-full h-8 w-8 shadow-md z-10"
            onClick={() => removeMedia(0)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-2 gap-1 rounded-lg overflow-hidden border">
        {mediaItems.map((item, idx) => (
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
              onClick={() => removeMedia(idx)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    );
  };

  return (
    <Card className="border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow duration-200 md:rounded-xl">
      <CardContent className="p-4">
        <div className="flex gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={user?.avatarUrl} />
            <AvatarFallback>{user?.fullName}</AvatarFallback>
          </Avatar>

          <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) handleClose(); else setOpen(true); }}>
            <DialogTrigger asChild>
              <Button
                variant="secondary"
                className="flex-1 justify-start rounded-full text-muted-foreground text-[17px] font-normal h-10 px-4"
              >
                {user?.fullName} ơi, bạn đang nghĩ gì thế?
              </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-[680px] p-0 gap-0 max-h-[90vh] flex flex-col">
              <DialogHeader className="p-4 border-b">
                <DialogTitle className="text-center text-base font-bold">
                  Tạo bài viết
                </DialogTitle>
              </DialogHeader>

              <form onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-4 overflow-y-auto flex-1">
                  <div className="flex gap-3 items-center">
                    <Avatar className="h-11 w-11">
                      <AvatarImage src={user?.avatarUrl} />
                    </Avatar>
                    <div>
                      <p className="font-bold text-[15px]">
                        {user?.fullName}
                      </p>
                      <div className="flex items-center gap-1 bg-[#e4e6eb] px-2 py-0.5 rounded-md w-fit mt-0.5 text-[12px] font-semibold">
                        <Users className="h-3 w-3" /> Bạn bè
                      </div>
                    </div>
                  </div>

                <div className="space-y-1">
                  <MentionInput
                    value={contentValue}
                    onChange={(value) => setValue("content", value)}
                    placeholder={`${user?.fullName} ơi, bạn đang nghĩ gì thế?`}
                    className="border-none focus:outline-none focus:ring-0 focus:border-0 focus:shadow-none text-base md:text-lg resize-none p-0 min-h-[200px] placeholder:text-muted-foreground/60 shadow-none"
                    mentionedUserIds={mentionedUserIds}
                    setMentionedUserIds={setMentionedUserIds}
                  />
                  {errors.content && (
                    <p className="text-xs text-destructive">
                      {errors.content.message}
                    </p>
                  )}
                </div>

                {/* Media Upload Section */}
                <div className="relative rounded-lg p-2 group">
                  {renderMediaGrid()}

                  {/* Add more button (when images exist but less than max) */}
                  {mediaItems.length > 0 && mediaItems.length < MAX_MEDIA_COUNT && (
                    <div
                      {...getRootProps()}
                      className="mt-2 flex items-center justify-center gap-2 py-2 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors text-muted-foreground text-sm"
                    >
                      <input {...getInputProps()} />
                      <ImageIcon className="h-4 w-4" />
                      <span>
                        Thêm ảnh/video ({mediaItems.length}/{MAX_MEDIA_COUNT})
                      </span>
                    </div>
                  )}

                  {/* Drop zone (when no images) */}
                  {mediaItems.length === 0 && (
                    <div
                      {...getRootProps()}
                      className={`flex flex-col items-center justify-center min-h-[180px] bg-[#f7f8fa] hover:bg-[#ecedf0] rounded-lg cursor-pointer transition-colors border-2 border-dashed ${
                        isDragActive ? "border-primary bg-primary/5" : "border-transparent"
                      }`}
                    >
                      <input {...getInputProps()} />
                      <div className="bg-[#e4e6eb] p-3 rounded-full mb-2">
                        <ImageIcon className="h-6 w-6" />
                      </div>
                      <p className="font-bold text-[17px]">Thêm ảnh/video</p>
                      <p className="text-xs text-muted-foreground">
                        hoặc kéo và thả (tối đa {MAX_MEDIA_COUNT} ảnh)
                      </p>
                    </div>
                  )}

                  {uploadError && (
                    <div className="flex items-center gap-2 text-destructive text-sm mt-2">
                      <AlertCircle className="h-4 w-4" />
                      <span>{uploadError}</span>
                    </div>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full font-bold bg-[#1877f2] hover:bg-[#166fe5] text-white py-6 text-md disabled:opacity-50"
                  disabled={!canSubmit || isSubmitting}
                >
                  {isSubmitting ? (
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  ) : (
                    "Đăng"
                  )}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );
};