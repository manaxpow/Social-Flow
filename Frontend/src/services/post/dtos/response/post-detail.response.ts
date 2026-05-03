import type { ReactType } from "@/services/react/dtos/react-type";
import type { AuthorDto } from "../shared/author.dto";
import type { PostMediaDto } from "../shared/post-media.dto";
import type { MentionDto } from "../shared/mention.dto";
import type { CommentPreviewDto } from "@/services/comment/dtos/comment-preview.dto";

export type PostType = "standard" | "avatarUpdate" | "coverUpdate" | "shared" | "media";

export interface PostDetailResponse {
  // Basic Info
  id: string;
  content?: string | null;
  type: PostType;
  createdAt: string;
  updatedAt?: string | null;

  // Author Information
  author: AuthorDto;

  // Media Items (Array instead of single URL)
  mediaItems: PostMediaDto[];

  // Interaction Counts
  reactionCount: number;
  commentCount: number;
  shareCount: number;

  // Mentions
  mentions: MentionDto[];

  // Sharing Logic
  sharedPost?: PostDetailResponse;
  isShared: boolean;

  // Social Previews
  topReactTypes: ReactType[];
  topComments: CommentPreviewDto[];
}