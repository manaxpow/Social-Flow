import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Heart, MessageSquare, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";

export interface MediaItem {
  id: string;
  mediaUrl: string;
  likes: number;
  comments: number;
  mediaType: "image" | "video";
  postId?: string;
}

interface MediaGalleryProps {
  items: MediaItem[];
  isLoading?: boolean;
  mediaType?: "all" | "image" | "video";
  onItemClick?: (item: MediaItem) => void;
}

export const MediaGallery = ({ items, isLoading = false, mediaType = "all", onItemClick }: MediaGalleryProps) => {
  const filteredItems = mediaType === "all"
    ? items
    : items.filter((item) => item.mediaType === mediaType);

  if (isLoading) {
    return (
      <Card className="border border-slate-200 dark:border-slate-800 shadow-sm">
        <CardHeader className="pb-3">
          <Skeleton className="h-6 w-24" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="w-full aspect-square rounded-md" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (filteredItems.length === 0) {
    return (
      <Card className="border border-slate-200 dark:border-slate-800 shadow-sm">
        <CardHeader className="pb-3">
          <h3 className="text-xl font-semibold">
            {mediaType === "video" ? "Videos" : mediaType === "image" ? "Photos" : "Media"}
          </h3>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <p className="text-sm">
              {mediaType === "video" ? "Chưa có video" : mediaType === "image" ? "Chưa có ảnh" : "Chưa có media"}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
      {filteredItems.map((item) => {
        const mediaCard = (
          <div
            className="relative aspect-square group cursor-pointer overflow-hidden rounded-lg border border-slate-200 dark:border-slate-800 bg-black/5"
            onClick={() => onItemClick?.(item)}
          >
            {item.mediaType === "video" ? (
              <video
                src={item.mediaUrl}
                className="object-cover w-full h-full"
              />
            ) : (
              <img
                src={item.mediaUrl}
                alt="Media"
                className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
              />
            )}
            
            {/* Hover overlay */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white gap-2 transition-opacity duration-200 p-2">
              <div className="flex items-center gap-3">
                {item.likes > 0 && (
                  <span className="flex items-center gap-1 font-semibold text-sm">
                    <Heart className="h-4 w-4 fill-white" /> {item.likes}
                  </span>
                )}
                {item.comments > 0 && (
                  <span className="flex items-center gap-1 font-semibold text-sm">
                    <MessageSquare className="h-4 w-4 fill-white" /> {item.comments}
                  </span>
                )}
              </div>
              {item.postId && (
                <span className="text-xs text-white/90 bg-black/50 px-2.5 py-1 rounded-full flex items-center gap-1 hover:bg-black/70 transition-colors">
                  <ExternalLink className="h-3 w-3" /> Xem bài viết
                </span>
              )}
            </div>
          </div>
        );

        if (item.postId && !onItemClick) {
          return (
            <Link key={item.id} to={`/photo/${item.postId}`} className="block">
              {mediaCard}
            </Link>
          );
        }

        return <div key={item.id}>{mediaCard}</div>;
      })}
    </div>
  );
};