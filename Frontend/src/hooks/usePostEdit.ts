import { useState } from "react";
import { useDropzone } from "react-dropzone";
import { useUpload } from "@/hooks/useUpload";
import { useUpdatePostMutation } from "@/hooks/mutations/useUpdatePostMutation";
import { MAX_MEDIA_COUNT } from "@/lib/zod/post/post.schema";
import type { PostDetailResponse } from "@/services/post/dtos/response/post-detail.response";
import type { EditMediaItem } from "@/components/features/social/post/components/edit-post-dialog";

export const usePostEdit = (post: PostDetailResponse) => {
  const [editOpen, setEditOpen] = useState(false);
  const [editContent, setEditContent] = useState(post.content ?? "");
  const [editMediaItems, setEditMediaItems] = useState<EditMediaItem[]>([]);
  const [mentionedUserIds, setMentionedUserIds] = useState<string[]>([]);

  const { uploadToCloud, deleteFromCloud, isUploading, progress, error: uploadError } = useUpload();
  const updatePostMutation = useUpdatePostMutation();

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

    updatePostMutation.mutate(
      {
        id: post.id,
        content: trimmed,
        media: mediaPayload,
        mentionedUserIds,
      },
      {
        onSuccess: () => {
          setEditOpen(false);
          setEditMediaItems([]);
          setMentionedUserIds([]);
        },
      }
    );
  };

  return {
    editOpen,
    editContent,
    setEditContent,
    editMediaItems,
    mentionedUserIds,
    setMentionedUserIds,
    isPending: updatePostMutation.isPending,
    progress,
    uploadError,
    getEditRootProps,
    getEditInputProps,
    isEditDragActive,
    removeEditMedia,
    handleStartEdit,
    handleCancelEdit,
    handleSaveEdit,
  };
};
