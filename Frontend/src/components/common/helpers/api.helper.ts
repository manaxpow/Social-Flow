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

    errorObject = {
      ...errorObject,
      ...serverData,
      status: status,
      detail: serverData?.detail || error.message,
      instance: serverData?.instance || "N/A",
    };

    console.error("API Error:", errorObject);
  }

  return {
    isSuccess: false,
    data: null,
    error: errorObject,
    status: status,
  };
};
