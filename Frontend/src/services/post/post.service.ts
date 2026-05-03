import api from "@/lib/axios/axios";
import { handleApiError } from "@/components/common/helpers/api.helper";
import type { ApiResponse } from "@/types/api.response";
import type { PostResponse } from "./dtos/response/post.response";
import type { PagedList } from "@/types/paged-list.response";
import type { PostDetailResponse } from "./dtos/response/post-detail.response";

const POST_PATH = "/post";

export const postService = {
  // 1. Lấy danh sách bài viết phân trang (Newsfeed)
  getPosts: async (
    pageNumber: number = 1,
    pageSize: number = 10,
  ): Promise<ApiResponse<PagedList<PostDetailResponse>>> => {
    try {
      const response = await api.get<PagedList<PostDetailResponse>>(
        `${POST_PATH}/my-posts`,
        {
          params: { pageNumber, pageSize },
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

  // 2. Lấy chi tiết một bài viết
  getPostById: async (id: string): Promise<ApiResponse<PostDetailResponse>> => {
    try {
      const response = await api.get<PostDetailResponse>(`${POST_PATH}/${id}`);

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

  // 3. Tạo bài viết mới
  createPost: async (params: {
    content: string;
    media?: Array<{
      url: string;
      publicId: string;
      type: string;
      sortOrder: number;
    }>;
    mentionedUserIds?: string[];
  }): Promise<ApiResponse<PostResponse>> => {
    try {
      const response = await api.post<PostResponse>(POST_PATH, {
        content: params.content,
        media: params.media ?? null,
        mentionedUserIds: params.mentionedUserIds ?? [],
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

  // 4. Cập nhật bài viết
  updatePost: async (params: {
    id: string;
    content?: string;
    media?: Array<{
      url: string;
      publicId: string;
      type: string;
      sortOrder: number;
    }>;
    mentionedUserIds?: string[];
  }): Promise<ApiResponse<PostResponse>> => {
    try {
      const response = await api.patch<PostResponse>(`${POST_PATH}/${params.id}`, {
        content: params.content,
        ...(params.media ? { media: params.media } : {}),
        mentionedUserIds: params.mentionedUserIds ?? [],
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

  // 5. Xóa bài viết
  deletePost: async (id: string): Promise<ApiResponse<null>> => {
    try {
      const response = await api.delete(`${POST_PATH}/${id}`);

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