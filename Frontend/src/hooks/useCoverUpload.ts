import { useState, useCallback } from "react";
import { userService } from "@/services/user/user.service";
import type { UserResponse } from "@/services/user/dtos/user.reponse";

interface UseCoverUploadReturn {
  updateCover: (file: File) => Promise<UserResponse | null>;
  isUploading: boolean;
  error: string | null;
  clearError: () => void;
}

export const useCoverUpload = (): UseCoverUploadReturn => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateCover = useCallback(
    async (file: File): Promise<UserResponse | null> => {
      setIsUploading(true);
      setError(null);

      try {
        // Validate file size (max 10MB for cover)
        if (file.size > 10 * 1024 * 1024) {
          throw new Error("Cover file size must be less than 10MB");
        }

        // Validate file type
        if (!file.type.startsWith("image/")) {
          throw new Error("Only image files are allowed for cover");
        }

        // Validate image dimensions (minimum 1200x400 for 3:1 aspect ratio)
        const img = new Image();
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
          img.src = URL.createObjectURL(file);
        });

        // Minimum dimensions check
        if (img.width < 1200 || img.height < 400) {
          console.warn(
            "Cover image is smaller than recommended (1200x400). Larger images work better for covers."
          );
        }

        // Call the backend service
        const response = await userService.updateCover(file);

        if (response.isSuccess && response.data) {
          return response.data;
        }

        throw new Error(response.error?.detail ?? "Failed to update cover");
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to update cover";
        setError(errorMessage);
        return null;
      } finally {
        setIsUploading(false);
      }
    },
    []
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    updateCover,
    isUploading,
    error,
    clearError,
  };
};