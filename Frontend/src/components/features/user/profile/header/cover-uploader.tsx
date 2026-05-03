import React, { useRef, useState, useCallback } from "react";
import Cropper, { type Area, type Point } from "react-easy-crop";
import { Camera, Loader2, Check, X } from "lucide-react";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAppDispatch } from "@/stores/hook";
import { updateUserProfile } from "@/stores/auth/auth.slice";
import api from "@/lib/axios/axios";
import { mediaService } from "@/services/media/media.service";
import type { SetupUploadResponse } from "@/services/media/dtos/setup-upload-response";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface CloudinaryUploadResponse {
  secure_url: string;
  public_id: string;
}

interface CoverUploaderProps {
  children: React.ReactNode;
  onCoverUpdate?: (coverUrl: string) => void;
  onPreview?: () => void;
  triggerUploadRef?: React.MutableRefObject<(() => void) | null>;
}

export const CoverUploader = ({
  children,
  onCoverUpdate,
  onPreview,
  triggerUploadRef,
}: CoverUploaderProps) => {
  const queryClient = useQueryClient();
  const dispatch = useAppDispatch();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Expose triggerUpload to parent via ref
  if (triggerUploadRef) {
    triggerUploadRef.current = () => fileInputRef.current?.click();
  }

  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState<number>(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [isUploadingToCloudinary, setIsUploadingToCloudinary] = useState<boolean>(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [uploadedPublicId, setUploadedPublicId] = useState<string | null>(null);

  // Mutation to update cover in backend
  const updateCoverMutation = useMutation({
    mutationFn: ({ coverUrl, publicId }: { coverUrl: string; publicId: string }) =>
      api.post("/user/cover", { coverUrl, mediaType: 1, publicId }),
    onSuccess: (response) => {
      const coverUrl = response.data?.coverUrl;
      if (coverUrl && onCoverUpdate) {
        onCoverUpdate(coverUrl);
      }
      toast.success("Cập nhật ảnh bìa thành công!");
      // Update Redux auth store immediately
      if (uploadedImageUrl) {
        dispatch(updateUserProfile({ coverUrl: uploadedImageUrl }));
      }
      queryClient.invalidateQueries({ queryKey: ["my-posts"] });
      queryClient.invalidateQueries({ queryKey: ["profile", "me"] });
      setIsDialogOpen(false);
      resetState();
    },
    onError: (error: unknown) => {
      const errorMessage = getErrorMessage(error, "updateCover");
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
    console.error(`[CoverUploader Error${context ? ` - ${context}` : ""}]`, error);
    
    if (typeof error === "string") {
      return error;
    }
    
    if (error && typeof error === "object") {
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
      
      if ("message" in error && typeof error.message === "string") {
        return error.message;
      }
      
      if ("detail" in error && typeof error.detail === "string") {
        return error.detail;
      }
      if ("title" in error && typeof error.title === "string") {
        return error.title;
      }
      
      console.error("[CoverUploader] Error structure:", JSON.stringify(error, null, 2));
    }
    
    return "Có lỗi xảy ra. Vui lòng thử lại sau.";
  };

  // Function to get upload signature from backend
  const getUploadSignature = async (
    folder: string = "socialflow/covers"
  ): Promise<SetupUploadResponse> => {
    console.log("[CoverUploader] Getting upload signature for folder:", folder);
    const result = await mediaService.getUploadSignature(folder);

    if (!result.isSuccess || !result.data) {
      console.error("[CoverUploader] Failed to get upload signature:", result);
      const errorMessage = result.error?.detail || result.error?.title || "Lỗi khi lấy chữ ký tải lên";
      throw new Error(errorMessage);
    }

    console.log("[CoverUploader] Upload signature received successfully");
    return result.data;
  };

  // Function to upload image to Cloudinary
  const uploadToCloudinary = async (
    file: File,
    signature: SetupUploadResponse
  ): Promise<CloudinaryUploadResponse> => {
    console.log("[CoverUploader] Uploading to Cloudinary, file size:", file.size, "bytes");
    
    const formData = new FormData();
    formData.append("file", file);
    formData.append("api_key", signature.apiKey);
    formData.append("timestamp", signature.timestamp.toString());
    formData.append("signature", signature.signature);
    formData.append("folder", "socialflow/covers");

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${signature.cloudName}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) {
      console.error("[CoverUploader] Cloudinary upload failed, status:", response.status);
      throw new Error("Lỗi khi tải ảnh lên Cloudinary");
    }

    const result = await response.json();
    console.log("[CoverUploader] Cloudinary upload successful");
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

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const file = e.dataTransfer.files[0];
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

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleSaveCrop = async (): Promise<void> => {
    try {
      if (!imageSrc || !croppedAreaPixels) {
        return;
      }

      console.log("[CoverUploader] Starting cover upload process");
      setIsUploadingToCloudinary(true);

      // 1. Crop image
      console.log("[CoverUploader] Step 1: Cropping image");
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
      console.log("[CoverUploader] Step 2: Converting canvas to blob");
      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob(resolve, "image/jpeg", 0.9);
      });

      if (!blob) {
        throw new Error("Không thể tạo tệp ảnh");
      }

      const file = new File([blob], "cover.jpg", { type: "image/jpeg" });
      console.log("[CoverUploader] Created file, size:", file.size, "bytes");

      // 3. Get signature from backend
      console.log("[CoverUploader] Step 3: Getting upload signature");
      const signature = await getUploadSignature();

      // 4. Upload to Cloudinary
      console.log("[CoverUploader] Step 4: Uploading to Cloudinary");
      const cloudinaryResponse = await uploadToCloudinary(file, signature);

      // 5. Store the uploaded image info
      console.log("[CoverUploader] Step 5: Storing uploaded image info");
      setUploadedImageUrl(cloudinaryResponse.secure_url);
      setUploadedPublicId(cloudinaryResponse.public_id);
      setIsUploadingToCloudinary(false);

      // 6. Update cover in backend
      console.log("[CoverUploader] Step 6: Updating cover in backend");
      updateCoverMutation.mutate({
        coverUrl: cloudinaryResponse.secure_url,
        publicId: cloudinaryResponse.public_id,
      });
    } catch (e) {
      console.error("[CoverUploader] Error in handleSaveCrop:", e);
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
      <div
        className="relative"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <div onClick={() => onPreview?.()}>
          {children}
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
        onOpenChange={(open) => {
          if (!updateCoverMutation.isPending && !isUploadingToCloudinary) {
            setIsDialogOpen(open);
          }
        }}
      >
        <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden gap-0">
          <DialogHeader className="p-4 border-b bg-white">
            <DialogTitle>Chỉnh sửa ảnh bìa</DialogTitle>
          </DialogHeader>

          <div className="relative h-[300px] w-full bg-[#1c1c1c]">
            {imageSrc && (
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={3 / 1}  // 3:1 Cinematic ratio
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
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={updateCoverMutation.isPending || isUploadingToCloudinary}
            >
              Hủy
            </Button>
            <Button
              onClick={handleSaveCrop}
              disabled={updateCoverMutation.isPending || isUploadingToCloudinary}
              className="bg-[#1877f2] hover:bg-[#166fe5] min-w-[120px]"
            >
              {(updateCoverMutation.isPending || isUploadingToCloudinary) ? (
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