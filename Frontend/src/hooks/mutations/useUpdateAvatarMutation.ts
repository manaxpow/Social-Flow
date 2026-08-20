import {
  useUpdateProfileImageMutation,
  type UseUpdateProfileImageOptions,
} from "./useUpdateProfileImageMutation";

export type UseUpdateAvatarMutationOptions = Omit<UseUpdateProfileImageOptions, "type">;

/**
 * Centralized mutation for saving a new avatar URL to the backend.
 * Delegates to the shared useUpdateProfileImageMutation under the hood.
 */
export const useUpdateAvatarMutation = (options: UseUpdateAvatarMutationOptions) =>
  useUpdateProfileImageMutation({ type: "avatar", ...options });

