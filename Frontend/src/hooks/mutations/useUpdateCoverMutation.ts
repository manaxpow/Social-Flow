import {
  useUpdateProfileImageMutation,
  type UseUpdateProfileImageOptions,
} from "./useUpdateProfileImageMutation";

export type UseUpdateCoverMutationOptions = Omit<UseUpdateProfileImageOptions, "type">;

/**
 * Centralized mutation for saving a new cover URL to the backend.
 * Delegates to the shared useUpdateProfileImageMutation under the hood.
 */
export const useUpdateCoverMutation = (options: UseUpdateCoverMutationOptions) =>
  useUpdateProfileImageMutation({ type: "cover", ...options });

