import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { userService } from "@/services/user/user.service";
import { postService } from "@/services/post/post.service";
import type { PostDetailResponse } from "@/services/post/dtos/response/post-detail.response";
import type { UserResponse } from "@/services/user/dtos/user.reponse";
import type { ApiResponse } from "@/types/api.response";
import type { PagedList } from "@/types/paged-list.response";
import { toast } from "sonner";

// Query keys
export const profileKeys = {
  all: ["profile"] as const,
  detail: (userId: string) => ["profile", userId] as const,
};

export const postsKeys = {
  all: ["posts"] as const,
  userPosts: (userId: string, page: number = 1, pageSize: number = 10) => 
    ["posts", userId, page, pageSize] as const,
};

// Get User Profile
export const useUserProfile = (userId: string) => {
  return useQuery({
    queryKey: profileKeys.detail(userId),
    queryFn: async () => {
      // If userId is "me", fetch current user
      // Otherwise, fetch specific user by ID
      const response = userId === "me" 
        ? await userService.getMe()
        : await userService.getById(userId);
        
      if (response.isSuccess && response.data) {
        return response.data;
      }
      const errorMessage = typeof response.error?.message === 'string' 
        ? response.error.message 
        : "Failed to fetch profile";
      throw new Error(errorMessage);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
};

// Get User Posts
export const useUserPosts = (userId: string, pageNumber: number = 1, pageSize: number = 10) => {
  return useQuery({
    queryKey: postsKeys.userPosts(userId, pageNumber, pageSize),
    queryFn: async () => {
      const response = await postService.getPosts(pageNumber, pageSize);
      if (response.isSuccess && response.data) {
        return response.data;
      }
      const errorMessage = typeof response.error?.message === 'string' 
        ? response.error.message 
        : "Failed to fetch posts";
      throw new Error(errorMessage);
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 1,
  });
};

// Create Post with Optimistic Updates
interface MediaItemInput {
  url: string;
  publicId: string;
  type: string;
  sortOrder: number;
}

interface CreatePostVariables {
  content: string;
  media?: MediaItemInput[];
  userId: string;
  mentionedUserIds?: string[];
}

export const useCreatePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ content, media, mentionedUserIds }: CreatePostVariables) => {
      const response = await postService.createPost({
        content,
        media: media && media.length > 0 ? media : undefined,
        mentionedUserIds: mentionedUserIds || [],
      });
      if (!response.isSuccess) {
        const errorMessage = typeof response.error?.detail === 'string' 
          ? response.error.detail 
          : "Failed to create post";
        throw new Error(errorMessage);
      }
      return response.data;
    },
    onMutate: async (variables) => {
      const { content, media, userId } = variables;
      
      // Cancel any outgoing refetches for all post queries
      await queryClient.cancelQueries({ queryKey: postsKeys.all });
      
      // Snapshot the previous value (try both "me" and actual userId)
      const previousPosts =
        queryClient.getQueryData<ApiResponse<PagedList<PostDetailResponse>>>(
          postsKeys.userPosts("me", 1, 10)
        ) ??
        queryClient.getQueryData<ApiResponse<PagedList<PostDetailResponse>>>(
          postsKeys.userPosts(userId, 1, 10)
        );

      // Determine which cache key to update
      const cacheKey = queryClient.getQueryData<ApiResponse<PagedList<PostDetailResponse>>>(
          postsKeys.userPosts("me", 1, 10)
        )
        ? postsKeys.userPosts("me", 1, 10)
        : postsKeys.userPosts(userId, 1, 10);
      
      // Optimistically update to the new value
      const optimisticPost: PostDetailResponse = {
        id: `temp-${Date.now()}`,
        content,
        type: "standard",
        author: {
          id: userId,
          fullName: "You",
          avatarUrl: null,
        },
        mediaItems: (media || []).map((m, i) => ({
          id: `temp-media-${i}`,
          url: m.url,
          publicId: m.publicId,
          mediaType: "Image" as const,
          order: m.sortOrder,
        })),
        reactionCount: 0,
        commentCount: 0,
        shareCount: 0,
        mentions: [],
        isShared: false,
        topReactTypes: [],
        topComments: [],
        createdAt: new Date().toISOString(),
      };
      
      queryClient.setQueryData<ApiResponse<PagedList<PostDetailResponse>>>(
        cacheKey,
        (old) => ({
          isSuccess: true,
          data: {
            items: [optimisticPost, ...(old?.data?.items || [])],
            totalCount: (old?.data?.totalCount || 0) + 1,
            currentPage: old?.data?.currentPage || 1,
            pageSize: old?.data?.pageSize || 10,
            totalPages: old?.data?.totalPages || 1,
            hasPrevious: false,
            hasNext: old?.data?.hasNext || false,
          },
          error: null,
          status: 200,
        })
      );
      
      // Return a context object with the snapshotted value
      return { previousPosts };
    },
    onError: (err, variables, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousPosts) {
        queryClient.setQueryData(
          postsKeys.userPosts("me", 1, 10),
          context.previousPosts
        );
      }
      // Extract the actual error message from the thrown error
      const errorMessage = err instanceof Error ? err.message : "Failed to create post. Please try again.";
      toast.error(errorMessage);
    },
    onSuccess: () => {
      toast.success("Post created successfully!");
    },
    onSettled: () => {
      // Invalidate all post queries to ensure server state is fresh
      queryClient.invalidateQueries({ queryKey: postsKeys.all });
    },
  });
};

// Delete Post with Optimistic Updates
interface DeletePostVariables {
  postId: string;
  userId: string;
}

export const useDeletePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ postId }: DeletePostVariables) => {
      const response = await postService.deletePost(postId);
      if (!response.isSuccess) {
        const errorMessage = typeof response.error?.message === 'string' 
          ? response.error.message 
          : "Failed to delete post";
        throw new Error(errorMessage);
      }
      return response.data;
    },
    onMutate: async (variables) => {
      const { postId, userId } = variables;
      
      // Cancel any outgoing refetches for all post queries
      await queryClient.cancelQueries({ queryKey: postsKeys.all });
      
      // Snapshot the previous value (try both "me" and actual userId)
      const previousPosts =
        queryClient.getQueryData<ApiResponse<PagedList<PostDetailResponse>>>(
          postsKeys.userPosts("me", 1, 10)
        ) ??
        queryClient.getQueryData<ApiResponse<PagedList<PostDetailResponse>>>(
          postsKeys.userPosts(userId, 1, 10)
        );

      // Determine which cache key to update
      const cacheKey = queryClient.getQueryData<ApiResponse<PagedList<PostDetailResponse>>>(
          postsKeys.userPosts("me", 1, 10)
        )
        ? postsKeys.userPosts("me", 1, 10)
        : postsKeys.userPosts(userId, 1, 10);
      
      // Optimistically remove the post
      queryClient.setQueryData<ApiResponse<PagedList<PostDetailResponse>>>(
        cacheKey,
        (old) => ({
          isSuccess: true,
          data: {
            items: old?.data?.items.filter((post: PostDetailResponse) => post.id !== postId) || [],
            totalCount: (old?.data?.totalCount || 1) - 1,
            currentPage: old?.data?.currentPage || 1,
            pageSize: old?.data?.pageSize || 10,
            totalPages: old?.data?.totalPages || 1,
            hasPrevious: false,
            hasNext: old?.data?.hasNext || false,
          },
          error: null,
          status: 200,
        })
      );
      
      return { previousPosts };
    },
    onError: (err, variables, context) => {
      if (context?.previousPosts) {
        queryClient.setQueryData(
          postsKeys.userPosts("me", 1, 10),
          context.previousPosts
        );
      }
      toast.error("Failed to delete post. Please try again.");
    },
    onSuccess: () => {
      toast.success("Post deleted successfully!");
    },
    onSettled: () => {
      // Invalidate all post queries to ensure server state is fresh
      queryClient.invalidateQueries({ queryKey: postsKeys.all });
    },
  });
};
