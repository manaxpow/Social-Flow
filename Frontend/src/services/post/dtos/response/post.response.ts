export interface PostResponse {
  id: string;
  content: string;
  mediaUrl?: string | null;
  authorId: string;
  createdAt: string;
}
