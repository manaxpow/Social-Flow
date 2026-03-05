import type { ReactType } from "@/services/react/dtos/react-type";

export interface PostDetailResponse {
  id: string;
  content: string;
  mediaUrl?: string | null;
  authorName: string;
  authorAvatarUrl?: string | null;
  reactionCount: number;
  commentCount: number;
  topComments: CommentResponse[];
  topReactTypes: ReactType[];
  myReaction?: ReactType | null;
  createdAt: string;
}
export interface CommentResponse {
  id: string;
  content: string;
  authorName: string;
  createdAt: string;
}
