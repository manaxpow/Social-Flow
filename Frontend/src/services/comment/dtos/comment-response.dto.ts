export interface CommentResponse {
  id: string;
  postId: string;
  author: {
    id: string;
    fullName: string;
    avatarUrl?: string | null;
  };
  authorId?: string;
  parentCommentId: string | null;
  content: string;
  media?: {
    url: string;
    type: string;
    thumbnailUrl?: string;
  } | null;
  reactionsCount: number;
  commentsCount: number;
  createdAt: string;
  updatedAt: string;
}
