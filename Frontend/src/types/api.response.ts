import type { ErrorApiResponse } from "./error.response";

export type ApiResponse<T> = {
  isSuccess: boolean;
  data: T | null;
  error: ErrorApiResponse | null;
  status: number;
};
