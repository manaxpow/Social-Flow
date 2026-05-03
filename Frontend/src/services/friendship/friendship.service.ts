import type { ApiResponse } from "@/types/api.response";
import type { UserResponse } from "@/services/user/dtos/user.reponse";
import api from "@/lib/axios/axios";
import { handleApiError } from "@/components/common/helpers/api.helper";

const FRIENDSHIP_PATH = "/friendship";

export const friendshipService = {
  getFriends: async (search?: string): Promise<ApiResponse<UserResponse[]>> => {
    try {
      const params = search ? { search } : {};
      const response = await api.get<UserResponse[]>(`${FRIENDSHIP_PATH}/friends`, { params });

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