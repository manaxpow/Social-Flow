import { useState, useCallback } from "react";
import { mediaService } from "@/services/media/media.service";

export interface UploadResult {
  secure_url: string;
  public_id: string;
  format?: string;
  width?: number;
  height?: number;
  bytes?: number;
}

interface UseUploadReturn {
  uploadToCloud: (file: File, folder?: string) => Promise<UploadResult>;
  uploadMultiple: (files: File[], folder?: string) => Promise<UploadResult[]>;
  isUploading: boolean;
  progress: number;
  error: string | null;
  deleteFromCloud: (publicId: string) => Promise<void>;
}

/**
 * Hook for uploading images to Cloudinary via backend-signed upload tokens.
 * Used by CreatePostCard and PostCard.
 */
export const useUpload = (): UseUploadReturn => {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const uploadToCloud = useCallback(
    async (file: File, folder: string = "socialflow/posts"): Promise<UploadResult> => {
      setIsUploading(true);
      setProgress(0);
      setError(null);

      try {
        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
          throw new Error("File size must be less than 10MB");
        }

        // Validate file type
        if (!file.type.startsWith("image/")) {
          throw new Error("Only image files are allowed");
        }

        // Progress simulation for UI feedback
        const progressInterval = setInterval(() => {
          setProgress((prev) => {
            if (prev >= 90) {
              clearInterval(progressInterval);
              return 90;
            }
            return prev + 10;
          });
        }, 200);

        // Fetch signature from backend and upload to Cloudinary using Signed Upload
        const data = await mediaService.getSignatureAndUpload(file, folder);

        clearInterval(progressInterval);
        setProgress(100);

        return {
          secure_url: data.secure_url,
          public_id: data.public_id,
          format: data.format ?? "",
          width: data.width ?? 0,
          height: data.height ?? 0,
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
    async (files: File[], folder: string = "socialflow/posts"): Promise<UploadResult[]> => {
      if (files.length === 0) return [];

      setIsUploading(true);
      setProgress(0);
      setError(null);

      try {
        const results: UploadResult[] = [];
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          const result = await uploadToCloud(file, folder);
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
