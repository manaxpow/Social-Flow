import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface PostOptionsMenuProps {
  isOwnPost: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

/**
 * Dropdown menu for post actions (Edit, Delete).
 * Rendered in PostCard header.
 */
export const PostOptionsMenu = ({
  isOwnPost,
  onEdit,
  onDelete,
}: PostOptionsMenuProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full h-7 w-7 sm:h-8 sm:w-8 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <MoreHorizontal className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 rounded-xl shadow-lg border-slate-200 dark:border-slate-800">
        {isOwnPost && (
          <DropdownMenuItem
            className="cursor-pointer font-semibold py-2.5 focus:bg-blue-50 focus:text-blue-600 dark:focus:bg-slate-800 dark:focus:text-blue-400"
            onClick={onEdit}
          >
            <Pencil className="mr-3 h-4 w-4" /> Chỉnh sửa bài viết
          </DropdownMenuItem>
        )}
        <DropdownMenuItem
          className="text-destructive cursor-pointer font-semibold py-2.5 focus:bg-red-50 focus:text-destructive dark:focus:bg-red-950/40"
          onClick={onDelete}
        >
          <Trash2 className="mr-3 h-4 w-4" /> Xóa bài viết
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
