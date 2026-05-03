import type { ApiResponse } from "@/types/api.response";
import type { UserResponse } from "./dtos/user.reponse";
import api from "@/lib/axios/axios";
import { handleApiError } from "@/components/common/helpers/api.helper";

const USER_PATH = "/user";

export const userService = {
  getMe: async (): Promise<ApiResponse<UserResponse>> => {
    try {
      const response = await api.get<UserResponse>(`${USER_PATH}/me`);

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

  getById: async (userId: string): Promise<ApiResponse<UserResponse>> => {
    try {
      const response = await api.get<UserResponse>(`${USER_PATH}/${userId}`);

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

  updateAvatar: async (file: File): Promise<ApiResponse<UserResponse>> => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await api.post<UserResponse>(
        `${USER_PATH}/avatar`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
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

  updateCover: async (file: File): Promise<ApiResponse<UserResponse>> => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await api.post<UserResponse>(
        `${USER_PATH}/cover`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
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
};
