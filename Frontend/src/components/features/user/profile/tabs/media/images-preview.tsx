import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface Image {
  id: string;
  url: string;
}

interface ImagesPreviewProps {
  images?: Image[];
  totalImages?: number;
  onViewAll?: () => void;
  isLoading?: boolean;
}

export const ImagesPreview = ({ 
  images = [], 
  totalImages = 0,
  onViewAll,
  isLoading = false
}: ImagesPreviewProps) => {
  const displayImages = images.slice(0, 9);

  const formatTotalImages = (count: number): string => {
    return count.toLocaleString();
  };

  if (isLoading) {
    return (
      <Card className="border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow duration-200">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-4 w-24" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3">
            {Array.from({ length: 9 }).map((_, i) => (
              <Skeleton key={i} className="w-full aspect-square rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (displayImages.length === 0) {
    return (
      <Card className="border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow duration-200">
        <CardHeader className="pb-3">
          <h3 className="text-xl font-semibold">Photos</h3>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <p className="text-sm">Chưa có ảnh</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold">Photos</h3>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {totalImages > 0 ? `${formatTotalImages(totalImages)} photos` : ""}
            </span>
            <button
              onClick={onViewAll}
              className="text-sm font-semibold text-[#0061FF] hover:underline transition-colors"
            >
              See all photos
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-3">
          {displayImages.map((image) => (
            <div 
              key={image.id} 
              className="relative aspect-square rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 group cursor-pointer transition-transform duration-200 hover:scale-105"
            >
              <img 
                src={image.url} 
                alt="Photo" 
                className="w-full h-full object-cover shadow-sm"
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};