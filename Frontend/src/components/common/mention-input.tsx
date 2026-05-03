import { useState, useRef, useEffect, useCallback } from "react";
import { useFloating, offset, flip, shift, autoUpdate, FloatingPortal } from "@floating-ui/react";
import { useDebouncedCallback } from "use-debounce";
import { Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { friendshipService } from "@/services/friendship/friendship.service";
import type { UserResponse } from "@/services/user/dtos/user.reponse";

interface MentionInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  mentionedUserIds: string[];
  setMentionedUserIds: (ids: string[]) => void;
}

export const MentionInput = ({
  value,
  onChange,
  placeholder,
  className,
  mentionedUserIds,
  setMentionedUserIds,
}: MentionInputProps) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [filteredFriends, setFilteredFriends] = useState<UserResponse[]>([]);
  const [mentionQuery, setMentionQuery] = useState("");
  const [mentionStart, setMentionStart] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { refs, floatingStyles } = useFloating({
    open: showSuggestions,
    placement: "bottom-start",
    middleware: [offset(4), flip(), shift()],
    whileElementsMounted: autoUpdate,
  });

  // Extract mention IDs from the internal format
  const extractMentionIds = useCallback((text: string): string[] => {
    const matches = text.match(/@\[([^\]]+)\]\(([^)]+)\)/g);
    return (
      matches?.map((m) => {
        const match = m.match(/\(([^)]+)\)/);
        return match ? match[1] : "";
      }) || []
    );
  }, []);

  // Convert internal format to display format for rendering
  const getDisplayText = (text: string): string => {
    return text.replace(/@\[([^\]]+)\]\(([^)]+)\)/g, (match, name) => `@${name}`);
  };

  // Fetch friends with debounced search
  const searchFriends = useDebouncedCallback(
    async (query: string) => {
      setIsLoading(true);
      const result = await friendshipService.getFriends(query || undefined);
      if (result.isSuccess && result.data) {
        setFilteredFriends(result.data.slice(0, 6)); // Show up to 6 friend suggestions
      }
      setIsLoading(false);
    },
    300
  );

  // Handle text input
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const textarea = e.target;
    const newValue = textarea.value;
    onChange(newValue);

    // Auto-resize textarea
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 400) + 'px';

    // Check if we're in a mention context
    const cursorPosition = textarea.selectionStart;
    const textBeforeCursor = newValue.slice(0, cursorPosition);
    const lastAtIndex = textBeforeCursor.lastIndexOf("@");

    // Check if @ is the last character or followed by text without spaces
    if (lastAtIndex !== -1) {
      const afterAt = textBeforeCursor.slice(lastAtIndex + 1);
      const hasSpace = afterAt.includes(" ");

      if (!hasSpace) {
        // We're in a mention context
        setMentionStart(lastAtIndex);
        setMentionQuery(afterAt);
        setShowSuggestions(true);
        setSelectedIndex(0);
        searchFriends(afterAt);
        return;
      }
    }

    // Not in mention context
    setShowSuggestions(false);
    setMentionStart(null);
    setMentionQuery("");
  };

  // Insert selected friend
  const selectFriend = (friend: UserResponse) => {
    if (mentionStart === null) return;

    const beforeMention = value.slice(0, mentionStart);
    const afterMention = value.slice(mentionStart + 1 + mentionQuery.length);

    // Insert in internal format: @[Name](guid)
    const mention = `@[${friend.fullName}](${friend.id})`;
    const newValue = beforeMention + mention + " " + afterMention;

    onChange(newValue);
    setShowSuggestions(false);
    setMentionStart(null);
    setMentionQuery("");
    setFilteredFriends([]);

    // Update mention IDs
    const newIds = extractMentionIds(newValue);
    setMentionedUserIds(newIds);

    // Focus textarea and move cursor after the mention
    setTimeout(() => {
      if (textareaRef.current) {
        const newCursorPosition = mentionStart + mention.length + 1;
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(newCursorPosition, newCursorPosition);
      }
    }, 0);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!showSuggestions || filteredFriends.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, filteredFriends.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Enter" || e.key === "Tab") {
      e.preventDefault();
      selectFriend(filteredFriends[selectedIndex]);
    } else if (e.key === "Escape") {
      e.preventDefault();
      setShowSuggestions(false);
    }
  };

  // Update mention IDs when value changes
  useEffect(() => {
    const ids = extractMentionIds(value);
    setMentionedUserIds(ids);
  }, [value, extractMentionIds, setMentionedUserIds]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        textareaRef.current &&
        !textareaRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="w-full relative">
      <textarea
        ref={(el) => {
          textareaRef.current = el;
          refs.setReference(el);
        }}
        value={getDisplayText(value)}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={`${className} w-full min-h-[120px] border-0 focus:outline-none focus:ring-0 focus:border-0 focus:shadow-none`}
      />

      <FloatingPortal>
        {showSuggestions && (
          <div
            ref={(el) => {
              dropdownRef.current = el;
              refs.setFloating(el);
            }}
            style={floatingStyles}
            className="bg-white dark:bg-slate-800 shadow-lg rounded-lg border border-slate-200 dark:border-slate-700 max-h-80 overflow-auto z-50 w-72"
          >
            {filteredFriends.length > 0 ? (
              filteredFriends.map((friend, index) => (
                <div
                  key={friend.id}
                  className={`flex items-center gap-3 px-3 py-2 cursor-pointer transition-colors ${
                    index === selectedIndex
                      ? "bg-blue-50 dark:bg-blue-900/30"
                      : "hover:bg-slate-50 dark:hover:bg-slate-700/50"
                  }`}
                  onClick={() => selectFriend(friend)}
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={friend.avatarUrl} alt={friend.fullName} />
                    <AvatarFallback className="bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-300">
                      {friend.fullName
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium text-sm text-slate-900 dark:text-slate-100">
                    {friend.fullName}
                  </span>
                </div>
              ))
            ) : !isLoading ? (
              <div className="px-3 py-2 text-sm text-muted-foreground">
                Không tìm thấy bạn bè
              </div>
            ) : null}
            {isLoading && filteredFriends.length === 0 && (
              <div className="flex items-center justify-center gap-2 px-3 py-3 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Đang tìm kiếm...</span>
              </div>
            )}
          </div>
        )}
      </FloatingPortal>
    </div>
  );
};