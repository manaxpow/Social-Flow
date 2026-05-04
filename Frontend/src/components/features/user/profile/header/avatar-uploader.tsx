import React, { useRef, useState, useCallback } from "react";
import Cropper, { type Area, type Point } from "react-easy-crop";
import { Camera, Loader2, Check } from "lucide-react";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAppDispatch } from "@/stores/hook";
import { updateUserProfile } from "@/stores/auth/auth.slice";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { mediaService } from "@/services/media/media.service";
import type { SetupUploadResponse } from "@/services/media/dtos/setup-upload-response";
import api from "@/lib/axios/axios";

interface CloudinaryUploadResponse {
  secure_url: string;
  public_id: string;
}

interface AvatarUploaderProps {
  currentAvatar?: string;
  initials: string;
  size?: "small" | "medium" | "large";
  onPreview?: () => void;
}

export const AvatarUploader = ({
  currentAvatar,
  initials,
  size = "medium",
  onPreview,
}: AvatarUploaderProps) => {
  // Size configurations
  const sizeClasses = {
    small: "w-28 h-28",
    medium: "w-32 h-32 md:w-40 md:h-40",
    large: "w-36 h-36 md:w-48 md:h-48",
  };

  const avatarSizeClass = sizeClasses[size];
  const queryClient = useQueryClient();
  const dispatch = useAppDispatch();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState<number>(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [isUploadingToCloudinary, setIsUploadingToCloudinary] = useState<boolean>(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [uploadedPublicId, setUploadedPublicId] = useState<string | null>(null);

  // Mutation to update avatar in backend
  const updateAvatarMutation = useMutation({
    mutationFn: ({ avatarUrl, publicId }: { avatarUrl: string; publicId: string }) =>
      api.post("/user/avatar", { avatarUrl, mediaType: 1, publicId }),
    onSuccess: () => {
      toast.success("Cập nhật ảnh đại diện thành công!");
      // Update Redux auth store immediately
      if (uploadedImageUrl) {
        dispatch(updateUserProfile({ avatarUrl: uploadedImageUrl }));
      }
      queryClient.invalidateQueries({ queryKey: ["my-posts"] });
      queryClient.invalidateQueries({ queryKey: ["profile", "me"] });
      setIsDialogOpen(false);
      resetState();
    },
    onError: (error: unknown) => {
      const errorMessage = getErrorMessage(error, "updateAvatar");
      toast.error(errorMessage);
    },
  });

  const onCropComplete = useCallback((_unUsedArea: Area, pixels: Area) => {
    setCroppedAreaPixels(pixels);
  }, []);

  const resetState = useCallback(() => {
    setImageSrc(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
    setIsUploadingToCloudinary(false);
    setUploadedImageUrl(null);
    setUploadedPublicId(null);
  }, []);

  // Helper function to safely extract error message
  const getErrorMessage = (error: unknown, context: string = ""): string => {
    console.error(`[AvatarUploader Error${context ? ` - ${context}` : ""}]`, error);
    
    if (typeof error === "string") {
      return error;
    }
    
    if (error && typeof error === "object") {
      // Handle axios errors
      if ("response" in error && error.response && typeof error.response === "object") {
        const response = error.response as any;
        if (response.data && typeof response.data === "object") {
          if (typeof response.data.detail === "string") {
            return response.data.detail;
          }
          if (typeof response.data.message === "string") {
            return response.data.message;
          }
          if (typeof response.data.title === "string") {
            return response.data.title;
          }
        }
        if (typeof response.statusText === "string") {
          return response.statusText;
        }
      }
      
      // Handle standard Error objects
      if ("message" in error && typeof error.message === "string") {
        return error.message;
      }
      
      // Handle API response error format
      if ("detail" in error && typeof error.detail === "string") {
        return error.detail;
      }
      if ("title" in error && typeof error.title === "string") {
        return error.title;
      }
      
      // Log the error structure for debugging
      console.error("[AvatarUploader] Error structure:", JSON.stringify(error, null, 2));
    }
    
    return "Có lỗi xảy ra. Vui lòng thử lại sau.";
  };

  // Function to get upload signature from backend
  const getUploadSignature = async (
    folder: string = "socialflow/avatars"
  ): Promise<SetupUploadResponse> => {
    console.log("[AvatarUploader] Getting upload signature for folder:", folder);
    const result = await mediaService.getUploadSignature(folder);

    if (!result.isSuccess || !result.data) {
      console.error("[AvatarUploader] Failed to get upload signature:", result);
      const errorMessage = result.error?.detail || result.error?.title || "Lỗi khi lấy chữ ký tải lên";
      throw new Error(errorMessage);
    }

    console.log("[AvatarUploader] Upload signature received successfully");
    return result.data;
  };

  // Function to upload image to Cloudinary
  const uploadToCloudinary = async (
    file: File,
    signature: SetupUploadResponse
  ): Promise<CloudinaryUploadResponse> => {
    console.log("[AvatarUploader] Uploading to Cloudinary, file size:", file.size, "bytes");
    console.log("[AvatarUploader] Cloudinary cloud name:", signature.cloudName);
    
    const formData = new FormData();
    formData.append("file", file);
    formData.append("api_key", signature.apiKey);
    formData.append("timestamp", signature.timestamp.toString());
    formData.append("signature", signature.signature);
    formData.append("folder", "socialflow/avatars");

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${signature.cloudName}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) {
      console.error("[AvatarUploader] Cloudinary upload failed, status:", response.status);
      try {
        const errorData = await response.json();
        console.error("[AvatarUploader] Cloudinary error response:", errorData);
      } catch (e) {
        console.error("[AvatarUploader] Could not parse Cloudinary error response");
      }
      throw new Error("Lỗi khi tải ảnh lên Cloudinary");
    }

    const result = await response.json();
    console.log("[AvatarUploader] Cloudinary upload successful, public_id:", result.public_id);
    return result;
  };

  // Function to delete image from Cloudinary
  const deleteFromCloudinary = async (publicId: string): Promise<void> => {
    try {
      const signature = await getUploadSignature();

      const formData = new FormData();
      formData.append("public_id", publicId);
      formData.append("api_key", signature.apiKey);
      formData.append("timestamp", signature.timestamp.toString());
      formData.append("signature", signature.signature);

      await fetch(
        `https://api.cloudinary.com/v1_1/${signature.cloudName}/image/destroy`,
        {
          method: "POST",
          body: formData,
        }
      );
    } catch (error) {
      console.error("Failed to delete image from Cloudinary:", error);
    }
  };

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
      if (!imageSrc || !croppedAreaPixels) {
        return;
      }

      console.log("[AvatarUploader] Starting avatar upload process");
      setIsUploadingToCloudinary(true);

      // 1. Crop image
      console.log("[AvatarUploader] Step 1: Cropping image");
      const image = new Image();
      image.src = imageSrc;

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

      // 2. Get blob from canvas
      console.log("[AvatarUploader] Step 2: Converting canvas to blob");
      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob(resolve, "image/jpeg", 0.9);
      });

      if (!blob) {
        throw new Error("Không thể tạo tệp ảnh");
      }

      const file = new File([blob], "avatar.jpg", { type: "image/jpeg" });
      console.log("[AvatarUploader] Created file, size:", file.size, "bytes");

      // 3. Get signature from backend
      console.log("[AvatarUploader] Step 3: Getting upload signature");
      const signature = await getUploadSignature();

      // 4. Upload to Cloudinary
      console.log("[AvatarUploader] Step 4: Uploading to Cloudinary");
      const cloudinaryResponse = await uploadToCloudinary(file, signature);

      // 5. Store the uploaded image info
      console.log("[AvatarUploader] Step 5: Storing uploaded image info");
      setUploadedImageUrl(cloudinaryResponse.secure_url);
      setUploadedPublicId(cloudinaryResponse.public_id);
      setIsUploadingToCloudinary(false);

      // 6. Update avatar in backend
      console.log("[AvatarUploader] Step 6: Updating avatar in backend");
      updateAvatarMutation.mutate({
        avatarUrl: cloudinaryResponse.secure_url,
        publicId: cloudinaryResponse.public_id,
      });
    } catch (e) {
      console.error("[AvatarUploader] Error in handleSaveCrop:", e);
      const errorMessage = getErrorMessage(e, "handleSaveCrop");
      toast.error(errorMessage);
      setIsUploadingToCloudinary(false);
    }
  };

  const handleCancel = async (): Promise<void> => {
    // Delete the uploaded image from Cloudinary if it exists
    if (uploadedPublicId) {
      await deleteFromCloudinary(uploadedPublicId);
    }
    setIsDialogOpen(false);
    resetState();
  };

  return (
    <>
      <div className="relative group">
        <div
          className={`relative cursor-pointer rounded-full border-[4px] border-background shadow-lg ${avatarSizeClass}`}
          onClick={() => onPreview?.()}
        >
          <Avatar className="w-full h-full">
            <AvatarImage src={currentAvatar} className="object-cover" />
            <AvatarFallback className="text-4xl bg-slate-100 font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
        </div>

        {/* Facebook-style camera button - bottom right, outside overflow */}
        <Button
          type="button"
          variant="secondary"
          size="icon"
          className="absolute bottom-0 right-0 h-9 w-9 rounded-full bg-white hover:bg-slate-100 text-slate-700 shadow-md border border-slate-200 z-20"
          onClick={(e) => {
            e.stopPropagation();
            fileInputRef.current?.click();
          }}
        >
          <Camera className="h-4 w-4" />
        </Button>

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
        onOpenChange={(open) => {
          if (!updateAvatarMutation.isPending && !isUploadingToCloudinary) {
            setIsDialogOpen(open);
          }
        }}
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
              onClick={handleCancel}
              disabled={updateAvatarMutation.isPending || isUploadingToCloudinary}
            >
              Hủy
            </Button>
            <Button
              onClick={handleSaveCrop}
              disabled={updateAvatarMutation.isPending || isUploadingToCloudinary}
              className="bg-[#1877f2] hover:bg-[#166fe5] min-w-[120px]"
            >
              {(updateAvatarMutation.isPending || isUploadingToCloudinary) ? (
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
