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
};
