import { Heart } from "lucide-react";
import type { PostDetailResponse } from "@/services/post/dtos/response/post-detail.response";

interface PostCardStatsProps {
  post: PostDetailResponse;
  onCommentClick: () => void;
}

/**
 * Renders post interaction stats (reaction count, comment count, share count).
 */
export const PostCardStats = ({ post, onCommentClick }: PostCardStatsProps) => {
  return (
    <div className="px-3 sm:px-4 py-2 sm:py-2.5 flex justify-between text-muted-foreground text-[13px] sm:text-[14px]">
      <div className="flex items-center gap-1.5 hover:underline cursor-pointer">
        <Heart className="h-4 w-4 fill-red-500 text-red-500" />
        <span>{post.reactionCount || 0}</span>
      </div>
      <div className="flex gap-3 text-muted-foreground/80">
        <span className="hover:underline cursor-pointer" onClick={onCommentClick}>
          {post.commentCount || 0} bình luận
        </span>
        <span className="hover:underline cursor-pointer">
          {post.shareCount || 0} lượt chia sẻ
        </span>
      </div>
    </div>
  );
};
