import api from "@/lib/axios/axios";
import { handleApiError } from "@/components/common/helpers/api.helper";
import type { ApiResponse } from "@/types/api.response";
import type { CommentResponse } from "./dtos/comment-response.dto";
import type { CommentMedia } from "./dtos/comment-media.dto";
import type { PagedList } from "@/types/paged-list.response";

const COMMENT_PATH = "/comment";

export const commentService = {
  // Tạo bình luận mới
  createComment: async (params: {
    postId: string;
    content?: string;
    parentCommentId?: string | null;
    media?: CommentMedia;
  }): Promise<ApiResponse<CommentResponse>> => {
    try {
      const response = await api.post<CommentResponse>(COMMENT_PATH, {
        PostId: params.postId,
        Content: params.content ?? null,
        ParentCommentId: params.parentCommentId ?? null,
        Media: params.media ?? null,
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

  // Cập nhật bình luận
  updateComment: async (
    id: string,
    content: string,
  ): Promise<ApiResponse<CommentResponse>> => {
    try {
      const response = await api.patch<CommentResponse>(`${COMMENT_PATH}/${id}`, {
        content,
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

  // Xóa bình luận
  deleteComment: async (id: string): Promise<ApiResponse<null>> => {
    try {
      const response = await api.delete(`${COMMENT_PATH}/${id}`);

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

  // Lấy bình luận cấp 1 của một comment (depth-1 replies)
  getRepliesByCommentId: async (
    commentId: string,
    pageNumber: number = 1,
    pageSize: number = 10
  ): Promise<ApiResponse<PagedList<CommentResponse>>> => {
    try {
      const response = await api.get<PagedList<CommentResponse>>(
        `${COMMENT_PATH}/${commentId}/replies`,
        {
          params: {
            pageNumber,
            pageSize,
          },
        }
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
