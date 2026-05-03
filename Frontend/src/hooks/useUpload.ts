import { useState, useCallback } from "react";
import { mediaService } from "@/services/media/media.service";

export interface UploadResult {
  secure_url: string;
  public_id: string;
  format: string;
  width: number;
  height: number;
  bytes: number;
}

interface UseUploadReturn {
  uploadToCloud: (file: File) => Promise<UploadResult>;
  uploadMultiple: (files: File[]) => Promise<UploadResult[]>;
  isUploading: boolean;
  progress: number;
  error: string | null;
  deleteFromCloud: (publicId: string) => Promise<void>;
}

export const useUpload = (): UseUploadReturn => {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const uploadToCloud = useCallback(
    async (file: File): Promise<UploadResult> => {
      setIsUploading(true);
      setProgress(0);
      setError(null);

      try {
        const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
        const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

        if (!cloudName || !uploadPreset) {
          throw new Error(
            "Cloudinary configuration missing. Please check environment variables."
          );
        }

        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
          throw new Error("File size must be less than 10MB");
        }

        // Validate file type
        if (!file.type.startsWith("image/")) {
          throw new Error("Only image files are allowed");
        }

        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", uploadPreset);
        formData.append("folder", "socialflow/posts");

        // Simulate progress (since Cloudinary doesn't provide progress for unsigned uploads)
        const progressInterval = setInterval(() => {
          setProgress((prev) => {
            if (prev >= 90) {
              clearInterval(progressInterval);
              return 90;
            }
            return prev + 10;
          });
        }, 200);

        const response = await fetch(
          `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
          {
            method: "POST",
            body: formData,
          }
        );

        clearInterval(progressInterval);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error?.message || "Failed to upload image to Cloudinary"
          );
        }

        const data = await response.json();
        setProgress(100);

        return {
          secure_url: data.secure_url,
          public_id: data.public_id,
          format: data.format,
          width: data.width,
          height: data.height,
          bytes: data.bytes,
        };
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to upload image";
        setError(errorMessage);
        throw err;
      } finally {
        setIsUploading(false);
      }
    },
    []
  );

  const uploadMultiple = useCallback(
    async (files: File[]): Promise<UploadResult[]> => {
      if (files.length === 0) return [];

      setIsUploading(true);
      setProgress(0);
      setError(null);

      try {
        const results: UploadResult[] = [];
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          const result = await uploadToCloud(file);
          results.push(result);
          setProgress(Math.round(((i + 1) / files.length) * 100));
        }
        return results;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to upload images";
        setError(errorMessage);
        throw err;
      } finally {
        setIsUploading(false);
      }
    },
    [uploadToCloud]
  );

  const deleteFromCloud = useCallback(async (publicId: string) => {
    try {
      const result = await mediaService.deleteMedia(publicId);
      if (!result.isSuccess) {
        console.error("Failed to delete image from Cloudinary:", result.error);
      }
    } catch (err) {
      console.error("Failed to delete image from Cloudinary:", err);
    }
  }, []);

  return {
    uploadToCloud,
    uploadMultiple,
    isUploading,
    progress,
    error,
    deleteFromCloud,
  };
};