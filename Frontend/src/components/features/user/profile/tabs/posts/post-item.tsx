import { PostCard } from "@/components/features/social/post/post-card";
import type { PostDetailResponse } from "@/services/post/dtos/response/post-detail.response";

interface PostItemProps {
  post: PostDetailResponse;
  onDelete?: (id: string) => void;
}

export const PostItem = ({ post, onDelete }: PostItemProps) => {
  return (
    <PostCard
      post={post}
      onDelete={onDelete || (() => {})}
    />
  );
};