import { useState, useCallback } from "react";
import { userService } from "@/services/user/user.service";
import type { UserResponse } from "@/services/user/dtos/user.reponse";

interface UseAvatarUploadReturn {
  updateAvatar: (file: File) => Promise<UserResponse | null>;
  isUploading: boolean;
  error: string | null;
  clearError: () => void;
}

export const useAvatarUpload = (): UseAvatarUploadReturn => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateAvatar = useCallback(
    async (file: File): Promise<UserResponse | null> => {
      setIsUploading(true);
      setError(null);

      try {
        // Validate file size (max 5MB for avatar)
        if (file.size > 5 * 1024 * 1024) {
          throw new Error("Avatar file size must be less than 5MB");
        }

        // Validate file type
        if (!file.type.startsWith("image/")) {
          throw new Error("Only image files are allowed for avatar");
        }

        // Validate image dimensions (optional - square recommendation)
        const img = new Image();
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
          img.src = URL.createObjectURL(file);
        });

        // Optional: Warn if not square
        if (img.width !== img.height) {
          console.warn(
            "Avatar image is not square. Square images work best for avores."
          );
        }

        // Call the backend service
        const response = await userService.updateAvatar(file);

        if (response.isSuccess && response.data) {
          return response.data;
        }

        throw new Error(response.error?.detail ?? "Failed to update avatar");
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to update avatar";
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
    updateAvatar,
    isUploading,
    error,
    clearError,
  };
};