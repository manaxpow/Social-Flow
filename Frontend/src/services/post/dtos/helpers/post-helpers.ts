import type { PostDetailResponse } from "../response/post-detail.response";

/**
 * Helper để lấy avatar từ post (backward compatible)
 */
export function getPostAvatar(post: PostDetailResponse): string | undefined {
  return post.author.avatarUrl ?? undefined;
}

/**
 * Helper để lấy tên tác giả
 */
export function getPostAuthorName(post: PostDetailResponse): string {
  return post.author.fullName;
}

/**
 * Helper để lấy media URL đầu tiên
 */
export function getFirstMediaUrl(post: PostDetailResponse): string | null {
  return post.mediaItems[0]?.url ?? null;
}

/**
 * Helper đếm số lượng ảnh/video
 */
export function getMediaCount(post: PostDetailResponse, type?: 'Image' | 'Video'): number {
  if (!type) return post.mediaItems.length;
  return post.mediaItems.filter(m => m.mediaType === type).length;
}

export function getPostActionText(type?: string | number): string | null {
  if (!type) return null;
  const typeStr = String(type).toLowerCase();
  if (typeStr === "avatarupdate" || typeStr === "avatar" || typeStr === "1") {
    return "đã cập nhật ảnh đại diện.";
  }
  if (typeStr === "coverupdate" || typeStr === "cover" || typeStr === "2") {
    return "đã cập nhật ảnh bìa.";
  }
  return null;
}

/**
 * Helper để flatten media từ nhiều posts thành array
 */
export function flattenMediaFromPosts(
  posts: PostDetailResponse[]
): Array<{
  id: string;
  mediaUrl: string;
  likes: number;
  comments: number;
  mediaType: 'image' | 'video';
}> {
  return posts.flatMap(post =>
    post.mediaItems.map(media => ({
      id: media.id,
      mediaUrl: media.url,
      likes: post.reactionCount,
      comments: post.commentCount,
      mediaType: media.mediaType === 'Video' ? 'video' : 'image',
    }))
  );
}