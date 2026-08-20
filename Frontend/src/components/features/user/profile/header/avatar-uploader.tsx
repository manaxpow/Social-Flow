import { useState, useCallback } from "react";
import Cropper, { type Area, type Point } from "react-easy-crop";
import { useDropzone } from "react-dropzone";
import { Camera, Loader2, Check } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useUpdateAvatarMutation } from "@/hooks/mutations/useUpdateAvatarMutation";
import { useImageCropUpload } from "@/hooks/useImageCropUpload";

interface AvatarUploaderProps {
  currentAvatar?: string;
  initials: string;
  size?: "small" | "medium" | "large";
  onPreview?: () => void;
}

const SIZE_CLASSES = {
  small: "w-28 h-28",
  medium: "w-32 h-32 md:w-40 md:h-40",
  large: "w-36 h-36 md:w-48 md:h-48",
} as const;

export const AvatarUploader = ({
  currentAvatar,
  initials,
  size = "medium",
  onPreview,
}: AvatarUploaderProps) => {
  const avatarSizeClass = SIZE_CLASSES[size];

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

  const { getInputProps, open: openFilePicker } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    multiple: false,
    noClick: true,
    noKeyboard: true,
  });

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

  const updateAvatarMutation = useUpdateAvatarMutation({
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
    filename: "avatar.jpg",
    cloudinaryFolder: "socialflow/avatars",
    mutation: updateAvatarMutation,
    urlKey: "avatarUrl",
    setUploadedImageUrl,
    setUploadedPublicId,
    setIsUploadingToCloudinary,
    setIsDialogOpen,
    resetState,
  });

  const isPending = updateAvatarMutation.isPending || isUploadingToCloudinary;

  return (
    <>
      <div className="relative group">
        {/* Avatar preview — click opens the post preview */}
        <div
          className={`relative cursor-pointer rounded-full border-4 border-background ring-4 ring-primary/30 hover:ring-primary shadow-xl transition-all duration-300 ${avatarSizeClass}`}
          onClick={() => onPreview?.()}
        >
          <Avatar className="w-full h-full">
            <AvatarImage src={currentAvatar} className="object-cover" />
            <AvatarFallback className="text-4xl bg-slate-100 font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
        </div>

        {/* Camera button — opens the file picker via react-dropzone */}
        <Button
          type="button"
          variant="secondary"
          size="icon"
          className="absolute bottom-0 right-0 h-9 w-9 rounded-full bg-white hover:bg-slate-100 text-slate-700 shadow-md border border-slate-200 z-20"
          onClick={(e) => {
            e.stopPropagation();
            openFilePicker();
          }}
        >
          <Camera className="h-4 w-4" />
        </Button>

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
        <DialogContent className="sm:max-w-125 p-0 overflow-hidden gap-0">
          <DialogHeader className="p-4 border-b bg-white">
            <DialogTitle>Chỉnh sửa ảnh đại diện</DialogTitle>
          </DialogHeader>

          <div className="relative h-87.5 w-full bg-[#1c1c1c]">
            {imageSrc && (
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="round"
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
                max={3}
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
