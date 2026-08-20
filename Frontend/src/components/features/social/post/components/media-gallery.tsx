import type { PostMediaDto } from "@/services/post/dtos/shared/post-media.dto";

interface MediaGalleryProps {
  mediaItems: PostMediaDto[];
  postType?: string;
  onImageClick: (mediaIndex: number) => void;
}

/**
 * Renders post media items (single image view, avatar update view, or multi-image grid view).
 */
export const MediaGallery = ({ mediaItems, postType, onImageClick }: MediaGalleryProps) => {
  if (!mediaItems || mediaItems.length === 0) return null;

  const isAvatarUpdate = postType && String(postType).toLowerCase().includes("avatar");

  if (isAvatarUpdate && mediaItems.length > 0) {
    return (
      <div
        className="bg-slate-50/50 dark:bg-slate-900/40 py-8 flex justify-center border-y border-slate-100 dark:border-slate-800 cursor-pointer group"
        onClick={() => onImageClick(0)}
      >
        <div className="w-56 h-56 sm:w-72 sm:h-72 rounded-full overflow-hidden border-4 border-background ring-4 ring-[#1877f2]/30 dark:ring-blue-500/40 shadow-2xl transition-all duration-300 group-hover:scale-105 group-hover:ring-[#1877f2]">
          <img
            src={mediaItems[0].url}
            alt="Ảnh đại diện"
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    );
  }

  if (mediaItems.length === 1) {
    return (
      <div
        className="bg-slate-50 dark:bg-slate-900 flex justify-center border border-slate-200/80 dark:border-slate-800 rounded-lg overflow-hidden cursor-pointer shadow-xs transition-all hover:border-primary/40 hover:shadow-md"
        onClick={() => onImageClick(0)}
      >
        <img
          src={mediaItems[0].url}
          alt="Ảnh bài viết"
          className="max-w-full h-auto object-contain max-h-[600px] hover:opacity-95 transition-opacity"
        />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-1 border border-slate-200/80 dark:border-slate-800 rounded-lg p-0.5 bg-slate-100 dark:bg-slate-900">
      {mediaItems.map((media, idx) => (
        <div
          key={media.id || idx}
          className="relative rounded-md overflow-hidden border border-slate-200/60 dark:border-slate-800 cursor-pointer transition-all hover:border-primary/50 hover:opacity-95"
          onClick={() => onImageClick(idx)}
        >
          <img
            src={media.url}
            alt={`Ảnh ${idx + 1}`}
            className="w-full h-[250px] object-cover"
          />
        </div>
      ))}
    </div>
  );
};
