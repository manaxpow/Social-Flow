import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Loader2, Send } from "lucide-react";

interface ReplyInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
  isPending: boolean;
  parentName: string;
  placeholder?: string;
  currentUserAvatar?: string | null;
}

const MAX_HEIGHT = 200;

export const ReplyInput = ({
  value,
  onChange,
  onSubmit,
  onCancel,
  isPending,
  parentName,
  placeholder,
  currentUserAvatar,
}: ReplyInputProps) => {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSubmit();
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const textarea = e.target as HTMLTextAreaElement;
    textarea.style.height = "auto";
    textarea.style.height = Math.min(textarea.scrollHeight, MAX_HEIGHT) + "px";
  };

  return (
    <div className="flex items-start gap-2 mt-2">
      <Avatar className="h-9 w-9 shrink-0">
        <AvatarImage src={currentUserAvatar ?? undefined} />
        <AvatarFallback className="bg-slate-100 dark:bg-slate-800 text-sm font-bold">
          ?
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-2xl px-4 py-2.5">
        <textarea
          placeholder={placeholder || `Phản hồi ${parentName}...`}
          className="flex-1 w-full bg-transparent text-[14px] outline-none placeholder:text-muted-foreground resize-none"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onInput={handleInput}
          disabled={isPending}
          rows={1}
          style={{ height: "24px", minHeight: "24px", maxHeight: MAX_HEIGHT + "px" }}
          autoFocus
        />
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="h-9 w-9 rounded-full text-blue-600 hover:text-blue-700 hover:bg-transparent shrink-0"
        onClick={onSubmit}
        disabled={isPending || !value.trim()}
      >
        {isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
      </Button>
      <Button variant="ghost" size="sm" className="text-[12px] h-9 px-3 shrink-0" onClick={onCancel}>
        Hủy
      </Button>
    </div>
  );
};
