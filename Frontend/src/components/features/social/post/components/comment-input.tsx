import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Loader2, Send, Smile, Image as ImageIcon, FileText, Sticker } from "lucide-react";

interface CommentInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  isPending: boolean;
  placeholder?: string;
  currentUserAvatar?: string | null;
  currentUserName?: string;
  maxLength?: number;
  showToolbar?: boolean;
}

const MAX_HEIGHT = 200;

export const CommentInput = ({
  value,
  onChange,
  onSubmit,
  isPending,
  placeholder = "Viết bình luận...",
  currentUserAvatar,
  currentUserName,
  maxLength = 2000,
  showToolbar = true,
}: CommentInputProps) => {
  const handleTextareaInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const textarea = e.target as HTMLTextAreaElement;
    const newValue = textarea.value.slice(0, maxLength);
    onChange(newValue);

    textarea.style.height = "auto";
    textarea.style.height = Math.min(textarea.scrollHeight, MAX_HEIGHT) + "px";
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSubmit();
    }
  };

  return (
    <div className="flex items-start gap-3">
      <Avatar className="h-10 w-10 shrink-0">
        <AvatarImage src={currentUserAvatar ?? undefined} />
        <AvatarFallback className="bg-slate-100 dark:bg-slate-800 text-sm font-bold">
          {currentUserName?.[0]?.toUpperCase() || "?"}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <div className="bg-slate-100 dark:bg-slate-800 rounded-2xl px-4 py-2.5">
          <textarea
            placeholder={placeholder}
            className="flex-1 w-full bg-transparent text-[14px] outline-none placeholder:text-muted-foreground resize-none"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onInput={handleTextareaInput}
            onKeyDown={handleKeyDown}
            disabled={isPending}
            style={{ height: "24px", minHeight: "24px", maxHeight: MAX_HEIGHT + "px" }}
          />
        </div>
        {showToolbar && (
          <div className="flex items-center justify-between mt-1.5">
            <div className="flex items-center gap-1.5">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 rounded-full text-muted-foreground hover:text-foreground hover:bg-transparent"
                title="Emoji"
              >
                <Smile className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 rounded-full text-muted-foreground hover:text-foreground hover:bg-transparent"
                title="Ảnh/Video"
              >
                <ImageIcon className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 rounded-full text-muted-foreground hover:text-foreground hover:bg-transparent"
                title="GIF"
              >
                <FileText className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 rounded-full text-muted-foreground hover:text-foreground hover:bg-transparent"
                title="Nhãn dán"
              >
                <Sticker className="h-5 w-5" />
              </Button>
            </div>
            <div className="flex items-center gap-3">
              <span
                className={`text-[12px] ${
                  value.length > maxLength * 0.9 ? "text-amber-500" : "text-muted-foreground"
                }`}
              >
                {value.length}/{maxLength}
              </span>
              {value.trim() && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 rounded-full text-blue-600 hover:text-blue-700 hover:bg-transparent"
                  onClick={onSubmit}
                  disabled={isPending}
                >
                  {isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
