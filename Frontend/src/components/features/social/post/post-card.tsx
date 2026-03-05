import {
  MoreHorizontal,
  Trash2,
  Globe,
  Heart,
  Share2,
  MessageCircle,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { PostDetailResponse } from "@/services/post/dtos/response/post-detail.response";

interface PostCardProps {
  post: PostDetailResponse;
  fullName: string;
  avatar?: string;
  onDelete: (id: string) => void;
}

export const PostCard = ({
  post,
  fullName,
  avatar,
  onDelete,
}: PostCardProps) => {
  // Hàm định dạng thời gian thân thiện (VD: 2 giờ trước) - Có thể dùng date-fns nếu muốn
  const formatPostDate = (date: string) => {
    return new Date(date).toLocaleDateString("vi-VN", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Card className="shadow-sm border-none md:border md:rounded-xl overflow-hidden bg-background transition-all">
      <CardHeader className="flex flex-row items-center justify-between p-4 pb-3">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 ring-1 ring-slate-100">
            <AvatarImage src={avatar} alt={fullName} className="object-cover" />
            <AvatarFallback className="bg-slate-100 font-bold text-slate-600">
              {fullName[0].toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-bold hover:underline cursor-pointer text-[15px] leading-tight">
              {fullName}
            </span>
            <div className="flex items-center gap-1 text-[12px] text-muted-foreground mt-0.5">
              <span>{formatPostDate(post.createdAt)}</span>
              <span>•</span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Globe className="h-3 w-3" />
                  </TooltipTrigger>
                  <TooltipContent>Công khai</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full h-8 w-8 hover:bg-slate-100"
            >
              <MoreHorizontal className="h-5 w-5 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-56 rounded-xl shadow-lg border-slate-200"
          >
            <DropdownMenuItem
              className="text-destructive cursor-pointer font-semibold py-2.5 focus:bg-red-50 focus:text-destructive"
              onClick={() => onDelete(post.id)}
            >
              <Trash2 className="mr-3 h-4 w-4" /> Xóa bài viết
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>

      <CardContent className="p-0">
        {/* Nội dung chữ */}
        <div className="px-4 pb-3">
          <p className="text-[15px] leading-relaxed whitespace-pre-wrap break-words">
            {post.content}
          </p>
        </div>

        {/* Media (Ảnh/Video) */}
        {post.mediaUrl && (
          <div className="bg-slate-50 flex justify-center border-y border-slate-100 overflow-hidden cursor-pointer">
            <img
              src={post.mediaUrl}
              alt="Post media"
              className="max-w-full h-auto max-h-[600px] object-contain transition-transform hover:scale-[1.01] duration-500"
            />
          </div>
        )}

        {/* Thống kê tương tác (Lượt thích, bình luận) */}
        <div className="px-4 py-2.5 flex justify-between text-muted-foreground text-[14px]">
          <div className="flex items-center hover:underline cursor-pointer">
            <div className="flex -space-x-1 mr-2">
              <div className="bg-blue-500 rounded-full p-1 ring-2 ring-background">
                <Heart className="h-3 w-3 text-white fill-white" />
              </div>
              <div className="bg-red-500 rounded-full p-1 ring-2 ring-background">
                <Heart className="h-3 w-3 text-white fill-white" />
              </div>
            </div>
            <span>{post.reactionCount || 0}</span>
          </div>
          <div className="flex gap-3 text-muted-foreground/80">
            <span className="hover:underline cursor-pointer">
              {post.commentCount || 0} bình luận
            </span>
            <span className="hover:underline cursor-pointer">
              0 lượt chia sẻ
            </span>
          </div>
        </div>

        {/* Nút tương tác chính */}
        <div className="flex items-center justify-around p-1 mx-3 border-t border-slate-100">
          <Button
            variant="ghost"
            className="flex-1 font-semibold text-muted-foreground hover:bg-slate-100 h-9 rounded-md gap-2"
          >
            <Heart className="h-5 w-5" />
            <span>Thích</span>
          </Button>
          <Button
            variant="ghost"
            className="flex-1 font-semibold text-muted-foreground hover:bg-slate-100 h-9 rounded-md gap-2"
          >
            <MessageCircle className="h-5 w-5" />
            <span>Bình luận</span>
          </Button>
          <Button
            variant="ghost"
            className="flex-1 font-semibold text-muted-foreground hover:bg-slate-100 h-9 rounded-md gap-2"
          >
            <Share2 className="h-5 w-5" />
            <span>Chia sẻ</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
