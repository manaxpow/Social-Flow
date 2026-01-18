import type { LoginValues } from "@/lib/zod/auth/login.schema";
import type { ApiResponse } from "@/types/api.response";
import type { LoginResponse } from "./dtos/login/login.response";
import api from "@/lib/axios/axios";
import type { RegisterResponse } from "./dtos/register/register.response";
import type { RegisterRequest } from "./dtos/register/register.request";
import { handleApiError } from "@/components/common/helpers/api.helper";
import type { ConfirmEmailRequest } from "./dtos/confirm-email/confirm-email.request";
import type { ResetPasswordRequest } from "./dtos/reset-password/reset-password.request";

const AUTH_PATH = "/auth";

export const authService = {
  login: async (
    credentials: LoginValues
  ): Promise<ApiResponse<LoginResponse>> => {
    try {
      const response = await api.post<LoginResponse>(
        `${AUTH_PATH}/login`,
        credentials
      );

      return {
        isSuccess: true,
        data: response.data,
        error: null,
        status: response.status,
      };
    } catch (error: unknown) {
      return handleApiError(error);
    }
  },

  register: async (
    credentials: RegisterRequest
  ): Promise<ApiResponse<RegisterResponse>> => {
    try {
      const response = await api.post<RegisterResponse>(
        `${AUTH_PATH}/register`,
        credentials
      );

      return {
        isSuccess: true,
        data: response.data,
        error: null,
        status: response.status,
      };
    } catch (error: unknown) {
      return handleApiError(error);
    }
  },

  confirmEmail: async (
    request: ConfirmEmailRequest
  ): Promise<ApiResponse<null>> => {
    try {
      const response = await api.post(`${AUTH_PATH}/confirm-email`, request);

      return {
        isSuccess: true,
        data: response.data,
        error: null,
        status: response.status,
      };
    } catch (error: unknown) {
      return handleApiError(error);
    }
  },

  forgotPassword: async (email: string): Promise<ApiResponse<null>> => {
    try {
      const response = await api.post(`${AUTH_PATH}/forgot-password`, {
        email,
      });

      return {
        isSuccess: true,
        data: response.data,
        error: null,
        status: response.status,
      };
    } catch (error: unknown) {
      return handleApiError(error);
    }
  },

  resetPassword: async (
    request: ResetPasswordRequest
  ): Promise<ApiResponse<null>> => {
    try {
      const response = await api.post(`${AUTH_PATH}/reset-password`, request);

      return {
        isSuccess: true,
        data: response.data,
        error: null,
        status: response.status,
      };
    } catch (error: unknown) {
      return handleApiError(error);
    }
  },

  refreshToken: async (): Promise<ApiResponse<null>> => {
    try {
      const response = await api.post(`${AUTH_PATH}/refresh-token`);

      return {
        isSuccess: true,
        data: response.data,
        error: null,
        status: response.status,
      };
    } catch (error: unknown) {
      return handleApiError(error);
    }
  },

  logout: async (): Promise<void> => {
    await api.post(`${AUTH_PATH}/logout`);
    window.location.href = "/auth/login";
  },
};
