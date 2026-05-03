import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Heart, MessageSquare } from "lucide-react";

interface MediaItem {
  id: string;
  mediaUrl: string;
  likes: number;
  comments: number;
  mediaType: "image" | "video";
}

interface MediaGalleryProps {
  items: MediaItem[];
  isLoading?: boolean;
  mediaType?: "all" | "image" | "video";
}

export const MediaGallery = ({ items, isLoading = false, mediaType = "all" }: MediaGalleryProps) => {
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
          <div className="grid grid-cols-3 gap-1">
            {Array.from({ length: 9 }).map((_, i) => (
              <Skeleton key={i} className="w-full aspect-square rounded-sm" />
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
    <div className="grid grid-cols-3 gap-1">
      {filteredItems.map((item) => (
        <div
          key={item.id}
          className="relative aspect-square group cursor-pointer overflow-hidden"
        >
          <img
            src={item.mediaUrl}
            alt="Media"
            className="object-cover w-full h-full transition-opacity group-hover:opacity-90"
          />
          {(item.likes > 0 || item.comments > 0) && (
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white gap-4 transition-opacity">
              {item.likes > 0 && (
                <span className="flex items-center gap-1 font-semibold">
                  <Heart className="h-5 w-5 fill-white" /> {item.likes}
                </span>
              )}
              {item.comments > 0 && (
                <span className="flex items-center gap-1 font-semibold">
                  <MessageSquare className="h-5 w-5 fill-white" /> {item.comments}
                </span>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};