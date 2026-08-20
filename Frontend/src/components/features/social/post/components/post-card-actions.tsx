import { Heart, MessageCircle, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PostCardActionsProps {
  onCommentClick: () => void;
}

/**
 * Renders post action buttons (Like, Comment, Share).
 */
export const PostCardActions = ({ onCommentClick }: PostCardActionsProps) => {
  return (
    <div className="flex items-center justify-around p-1 mx-1 sm:mx-3 border-t border-slate-100 dark:border-slate-800">
      <Button
        variant="ghost"
        className="flex-1 font-semibold text-muted-foreground hover:bg-slate-100 dark:hover:bg-slate-800 h-8 sm:h-9 rounded-md gap-1 sm:gap-2 text-xs sm:text-sm px-1 sm:px-3"
      >
        <Heart className="h-4 sm:h-5 w-4 sm:w-5" />
        <span>Thích</span>
      </Button>
      <Button
        variant="ghost"
        className="flex-1 font-semibold text-muted-foreground hover:bg-slate-100 dark:hover:bg-slate-800 h-8 sm:h-9 rounded-md gap-1 sm:gap-2 text-xs sm:text-sm px-1 sm:px-3"
        onClick={onCommentClick}
      >
        <MessageCircle className="h-4 sm:h-5 w-4 sm:w-5" />
        <span>Bình luận</span>
      </Button>
      <Button
        variant="ghost"
        className="flex-1 font-semibold text-muted-foreground hover:bg-slate-100 dark:hover:bg-slate-800 h-8 sm:h-9 rounded-md gap-1 sm:gap-2 text-xs sm:text-sm px-1 sm:px-3"
      >
        <Share2 className="h-4 sm:h-5 w-4 sm:w-5" />
        <span>Chia sẻ</span>
      </Button>
    </div>
  );
};
