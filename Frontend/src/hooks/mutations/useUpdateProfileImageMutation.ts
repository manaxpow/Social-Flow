import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAppDispatch } from "@/stores/hook";
import { updateUserProfile } from "@/stores/auth/auth.slice";
import api from "@/lib/axios/axios";
import { getErrorMessage } from "@/components/common/helpers/api.helper";

export interface UseUpdateProfileImageOptions {
  type: "avatar" | "cover";
  /** Optimistic image URL stored locally — used to update Redux immediately on success. */
  uploadedImageUrl: string | null;
  onSuccess?: () => void;
}

const CONFIG = {
  avatar: {
    endpoint: "/user/avatar",
    urlKey: "avatarUrl",
    successMessage: "Cập nhật ảnh đại diện thành công!",
    errorContext: "updateAvatar",
  },
  cover: {
    endpoint: "/user/cover",
    urlKey: "coverUrl",
    successMessage: "Cập nhật ảnh bìa thành công!",
    errorContext: "updateCover",
  },
} as const;

/**
 * Shared generic mutation for uploading and updating profile images (avatar or cover).
 * Handles Redux store update, query invalidation, toast notifications,
 * and error extraction.
 */
export const useUpdateProfileImageMutation = ({
  type,
  uploadedImageUrl,
  onSuccess,
}: UseUpdateProfileImageOptions) => {
  const queryClient = useQueryClient();
  const dispatch = useAppDispatch();
  const config = CONFIG[type];

  return useMutation<unknown, unknown, Record<string, string>>({
    mutationFn: (variables) =>
      api.post(config.endpoint, {
        [config.urlKey]: variables[config.urlKey],
        mediaType: 1,
        publicId: variables.publicId,
      }),

    onSuccess: () => {
      toast.success(config.successMessage);
      if (uploadedImageUrl) {
        dispatch(updateUserProfile({ [config.urlKey]: uploadedImageUrl }));
      }
      queryClient.invalidateQueries({ queryKey: ["my-posts"] });
      queryClient.invalidateQueries({ queryKey: ["profile", "me"] });
      onSuccess?.();
    },

    onError: (error) => {
      toast.error(getErrorMessage(error, config.errorContext));
    },
  });
};
