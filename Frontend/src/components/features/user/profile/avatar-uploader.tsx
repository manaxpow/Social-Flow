import React, { useRef, useState, useCallback } from "react";
import Cropper, { type Area, type Point } from "react-easy-crop";
import { Camera, Loader2, Check } from "lucide-react";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { userService } from "@/services/user/user.service";

interface AvatarUploaderProps {
  currentAvatar?: string;
  initials: string;
}

export const AvatarUploader = ({
  currentAvatar,
  initials,
}: AvatarUploaderProps) => {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState<number>(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);

  const uploadMutation = useMutation({
    mutationFn: (file: File) => userService.updateAvatar(file),
    onSuccess: (response) => {
      if (response.isSuccess) {
        toast.success("Cập nhật ảnh đại diện thành công!");
        queryClient.invalidateQueries({ queryKey: ["my-posts"] });
        queryClient.invalidateQueries({ queryKey: ["user-profile"] });
        setIsDialogOpen(false);
        setImageSrc(null);
      } else {
        toast.error(response.error?.detail || "Lỗi upload");
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Lỗi kết nối server");
    },
  });

  const onCropComplete = useCallback((_unUsedArea: Area, pixels: Area) => {
    setCroppedAreaPixels(pixels);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Vui lòng chọn tệp hình ảnh hợp lệ");
        return;
      }
      const reader = new FileReader();
      reader.addEventListener("load", () => {
        setImageSrc(reader.result as string);
        setIsDialogOpen(true);
      });
      reader.readAsDataURL(file);
    }
  };

  const handleSaveCrop = async (): Promise<void> => {
    try {
      if (!imageSrc || !croppedAreaPixels) return;

      const image = new Image();
      image.src = imageSrc;

      // Chờ ảnh load để lấy context vẽ canvas
      await new Promise((resolve) => {
        image.onload = resolve;
      });

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Could not get canvas context");

      canvas.width = croppedAreaPixels.width;
      canvas.height = croppedAreaPixels.height;

      ctx.drawImage(
        image,
        croppedAreaPixels.x,
        croppedAreaPixels.y,
        croppedAreaPixels.width,
        croppedAreaPixels.height,
        0,
        0,
        croppedAreaPixels.width,
        croppedAreaPixels.height,
      );

      canvas.toBlob(
        (blob) => {
          if (blob) {
            const file = new File([blob], "avatar.jpg", { type: "image/jpeg" });
            uploadMutation.mutate(file);
          }
        },
        "image/jpeg",
        0.9,
      ); // Chất lượng 90%
    } catch (e) {
      const error = e as Error;
      toast.error(error.message || "Lỗi khi xử lý ảnh");
    }
  };

  return (
    <>
      <div className="relative group">
        <div
          className="relative cursor-pointer overflow-hidden rounded-full border-[4px] border-background shadow-lg w-36 h-36 md:w-44 md:h-44"
          onClick={() => fileInputRef.current?.click()}
        >
          <Avatar className="w-full h-full">
            <AvatarImage src={currentAvatar} className="object-cover" />
            <AvatarFallback className="text-4xl bg-slate-100 font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <Camera className="text-white h-8 w-8" />
          </div>
        </div>

        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*"
          onChange={handleFileChange}
        />
      </div>

      <Dialog
        open={isDialogOpen}
        onOpenChange={(open) =>
          !uploadMutation.isPending && setIsDialogOpen(open)
        }
      >
        <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden gap-0">
          <DialogHeader className="p-4 border-b bg-white">
            <DialogTitle>Chỉnh sửa ảnh đại diện</DialogTitle>
          </DialogHeader>

          <div className="relative h-[350px] w-full bg-[#1c1c1c]">
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
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              disabled={uploadMutation.isPending}
            >
              Hủy
            </Button>
            <Button
              onClick={handleSaveCrop}
              disabled={uploadMutation.isPending}
              className="bg-[#1877f2] hover:bg-[#166fe5] min-w-[120px]"
            >
              {uploadMutation.isPending ? (
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
