import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PostCard } from "@/components/features/social/post/post-card";
import { postService } from "@/services/post/post.service";

export const PostDetailPage = () => {
  const { postId } = useParams();
  const navigate = useNavigate();

  const { data: response, isLoading, isError } = useQuery({
    queryKey: ["post", postId],
    queryFn: () => postService.getPostById(postId!),
    enabled: !!postId,
  });

  const post = response?.data;

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      await postService.deletePost(id);
      navigate(-1);
    }
  };

  return (
    <div className="max-w-[680px] mx-auto px-4 py-6">
      <div className="mb-4">
        <Button
          variant="ghost"
          size="sm"
          className="gap-2 text-muted-foreground hover:text-foreground"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
      </div>

      {isLoading && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
          <Skeleton className="h-48 w-full rounded-lg" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      )}

      {isError && (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg">
            Post not found or has been deleted.
          </p>
          <Button variant="outline" className="mt-4" onClick={() => navigate(-1)}>
            Go Back
          </Button>
        </div>
      )}

      {post && <PostCard post={post} onDelete={handleDelete} />}
    </div>
  );
};