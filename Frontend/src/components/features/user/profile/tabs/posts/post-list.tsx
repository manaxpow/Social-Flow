import { PostItem } from "./post-item";
import { Skeleton } from "@/components/ui/skeleton";
import type { PostDetailResponse } from "@/services/post/dtos/response/post-detail.response";

interface PostListProps {
  posts?: PostDetailResponse[];
  isLoading?: boolean;
  onDelete?: (id: string) => void;
}

export const PostList = ({ posts = [], isLoading = false, onDelete }: PostListProps) => {
  // Sort posts by createdAt descending (newest first)
  const sortedPosts = [...posts].sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="space-y-4">
            <Skeleton className="h-14 w-3/4" />
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ))}
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
        <p className="text-lg font-medium">No posts yet</p>
        <p className="text-sm mt-2">
          Create your first post to get started!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {sortedPosts.map((post) => (
        <PostItem
          key={post.id}
          post={post}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};