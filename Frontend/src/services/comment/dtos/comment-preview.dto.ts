export interface CommentPreviewDto {
  id: string;
  content: string;
  reactionCount: number;
  authorId: string;
  authorName: string;
  authorAvatarUrl?: string | null;
  createdAt: string;
  replyCount?: number;
}
