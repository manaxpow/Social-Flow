import { useState, useCallback, useEffect } from "react";
import Cropper, { type Area, type Point } from "react-easy-crop";
import { useDropzone } from "react-dropzone";
import { Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useUpdateCoverMutation } from "@/hooks/mutations/useUpdateCoverMutation";
import { useImageCropUpload } from "@/hooks/useImageCropUpload";

interface CoverUploaderProps {
  children: React.ReactNode;
  onPreview?: () => void;
  triggerUploadRef?: React.MutableRefObject<(() => void) | null>;
}

export const CoverUploader = ({
  children,
  onPreview,
  triggerUploadRef,
}: CoverUploaderProps) => {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState<number>(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [isUploadingToCloudinary, setIsUploadingToCloudinary] = useState<boolean>(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [uploadedPublicId, setUploadedPublicId] = useState<string | null>(null);

  // ─── File handling via react-dropzone ───────────────────────────────────────
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;
    const dataUrl = URL.createObjectURL(file);
    setImageSrc(dataUrl);
    setIsDialogOpen(true);
  }, []);

  const { getRootProps, getInputProps, open: openFilePicker } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    multiple: false,
    noClick: true,   // clicks handled manually (preview vs upload)
    noKeyboard: true,
  });

  // Expose the dropzone's file-picker to the parent camera button
  useEffect(() => {
    if (!triggerUploadRef) return;

    triggerUploadRef.current = openFilePicker;

    return () => {
      triggerUploadRef.current = null;
    };
  }, [triggerUploadRef, openFilePicker]);

  // ─── Mutation ────────────────────────────────────────────────────────────────
  const resetState = useCallback(() => {
    setImageSrc(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
    setIsUploadingToCloudinary(false);
    setUploadedImageUrl(null);
    setUploadedPublicId(null);
  }, []);

  const updateCoverMutation = useUpdateCoverMutation({
    uploadedImageUrl,
    onSuccess: () => {
      setIsDialogOpen(false);
      resetState();
    },
  });

  // ─── Crop handlers ───────────────────────────────────────────────────────────
  const onCropComplete = useCallback((_: Area, pixels: Area) => {
    setCroppedAreaPixels(pixels);
  }, []);

  const { handleSaveCrop, handleCancel } = useImageCropUpload({
    imageSrc,
    croppedAreaPixels,
    uploadedPublicId,
    filename: "cover.jpg",
    cloudinaryFolder: "socialflow/covers",
    mutation: updateCoverMutation,
    urlKey: "coverUrl",
    setUploadedImageUrl,
    setUploadedPublicId,
    setIsUploadingToCloudinary,
    setIsDialogOpen,
    resetState,
  });

  const isPending = updateCoverMutation.isPending || isUploadingToCloudinary;

  return (
    <>
      {/* Dropzone wrapper — handles drag-and-drop over the cover area */}
      <div {...getRootProps()} className="relative">
        <div onClick={() => onPreview?.()}>
          {children}
        </div>
        {/* Hidden input managed by react-dropzone */}
        <input {...getInputProps()} />
      </div>

      {/* Crop dialog */}
      <Dialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          if (!isPending) setIsDialogOpen(open);
        }}
      >
        <DialogContent className="sm:max-w-150 p-0 overflow-hidden gap-0">
          <DialogHeader className="p-4 border-b bg-white">
            <DialogTitle>Chỉnh sửa ảnh bìa</DialogTitle>
          </DialogHeader>

          <div className="relative h-75 w-full bg-[#1c1c1c]">
            {imageSrc && (
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={3 / 1}
                cropShape="rect"
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
              />
            )}
          </div>

          <div className="p-6 bg-white border-t">
            <div className="flex flex-col gap-2">
              <div className="flex justify-between text-sm font-medium">
                <span>Phóng to</span>
                <span>{Math.round(zoom * 100)}%</span>
              </div>
              <input
                type="range"
                min={1}
                max={2}
                step={0.1}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#1877f2]"
              />
            </div>
          </div>

          <DialogFooter className="p-4 bg-slate-50 border-t flex flex-row justify-end gap-2">
            <Button variant="outline" onClick={handleCancel} disabled={isPending}>
              Hủy
            </Button>
            <Button
              onClick={handleSaveCrop}
              disabled={isPending}
              className="bg-[#1877f2] hover:bg-[#166fe5] min-w-30"
            >
              {isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Check className="mr-2 h-4 w-4" />
              )}
              Lưu thay đổi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
