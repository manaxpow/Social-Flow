import type { ApiResponse } from "@/types/api.response";
import type { SetupUploadResponse } from "./dtos/setup-upload-response";
import api from "@/lib/axios/axios";
import { handleApiError } from "@/components/common/helpers/api.helper";

const MEDIA_PATH = "/media";

export const mediaService = {
  getUploadSignature: async (
    folder: string = "socialflow/avatars"
  ): Promise<ApiResponse<SetupUploadResponse>> => {
    try {
      const response = await api.get<SetupUploadResponse>(
        `${MEDIA_PATH}/setup-upload`,
        { params: { folder } }
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

  deleteMedia: async (
    publicId: string,
    mediaType: string = "Image"
  ): Promise<ApiResponse<null>> => {
    try {
      await api.delete(MEDIA_PATH, {
        params: { publicId, mediaType },
      });

      return {
        isSuccess: true,
        data: null,
        error: null,
        status: 200,
      };
    } catch (error: unknown) {
      return handleApiError(error);
    }
  },
};
