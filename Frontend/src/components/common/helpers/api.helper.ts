// lib/api/api-helper.ts
import type { ApiResponse } from "@/types/api.response";
import type { ErrorApiResponse } from "@/types/error.response";
import axios from "axios";

export const handleApiError = <T>(error: unknown): ApiResponse<T> => {
  let status = 500;
  let errorObject: ErrorApiResponse = {
    title: "Server Error",
    status: 500,
    detail: "An unexpected error occurred.",
    instance: "N/A",
  };

  if (axios.isAxiosError(error)) {
    status = error.response?.status || 500;
    const serverData = error.response?.data as ErrorApiResponse;

    // Extract validation errors if present
    let detail = serverData?.detail || error.message;
    if (serverData?.errors && typeof serverData.errors === 'object') {
      const validationErrors = serverData.errors as Record<string, string[]>;
      const errorMessages = Object.values(validationErrors).flat();
      if (errorMessages.length > 0) {
        detail = errorMessages.join(' | ');
      }
    }

    errorObject = {
      ...errorObject,
      ...serverData,
      status: status,
      detail: detail,
      instance: serverData?.instance || "N/A",
    };

    console.error("API Error:", errorObject);
    console.error(errorObject.detail);
  }

  return {
    isSuccess: false,
    data: null,
    error: errorObject,
    status: status,
  };
};

/**
 * Safely extracts a human-readable error message from any unknown error shape.
 * Handles Axios response errors, plain Error objects, and primitive strings.
 *
 * @param error   - The caught error value (unknown type)
 * @param context - Optional label prepended to the console log (e.g. "updateAvatar")
 */
export const getErrorMessage = (error: unknown, context: string = ""): string => {
  console.error(`[${context || "App"}]`, error);
  if (typeof error === "string") return error;
  if (error && typeof error === "object") {
    const e = error as Record<string, unknown>;
    const resp = e.response as Record<string, unknown> | undefined;
    if (resp) {
      const data = resp.data as Record<string, unknown> | undefined;
      if (typeof data?.detail === "string") return data.detail;
      if (typeof data?.message === "string") return data.message;
      if (typeof data?.title === "string") return data.title;
      if (typeof resp.statusText === "string") return resp.statusText;
    }
    if (typeof e.message === "string") return e.message;
    if (typeof e.detail === "string") return e.detail;
    if (typeof e.title === "string") return e.title;
  }
  return "Có lỗi xảy ra. Vui lòng thử lại sau.";
};
