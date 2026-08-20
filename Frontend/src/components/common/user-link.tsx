import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface UserLinkProps {
  userId: string;
  avatarUrl?: string | null;
  name?: string | null;
  avatarClassName?: string;
  className?: string;
  subtext?: ReactNode;
}

export function UserLink({
  userId,
  avatarUrl,
  name,
  avatarClassName = "h-10 w-10",
  className = "",
  subtext,
}: UserLinkProps) {
  const initial = name?.[0]?.toUpperCase() || "?";

  return (
    <Link
      to={`/profile/${userId}`}
      className={`flex items-center gap-3 group ${className}`}
    >
      <Avatar className={`${avatarClassName} ring-2 ring-primary/25 hover:ring-primary border border-background shadow-2xs transition-all duration-200`}>
        <AvatarImage
          src={avatarUrl ?? undefined}
          alt={name ?? ""}
          className="object-cover"
        />
        <AvatarFallback className="bg-slate-100 font-bold text-slate-600">
          {initial}
        </AvatarFallback>
      </Avatar>
      <div className="flex flex-col">
        <span className="font-bold group-hover:underline text-[15px] leading-tight">
          {name}
        </span>
        {subtext && <div>{subtext}</div>}
      </div>
    </Link>
  );
}

/**
 * Compact version — renders only an avatar wrapped in a link (no name text).
 * Useful for comment avatars where the name is shown separately.
 */
interface UserAvatarLinkProps {
  userId: string;
  avatarUrl?: string | null;
  name?: string | null;
  className?: string;
}

export function UserAvatarLink({
  userId,
  avatarUrl,
  name,
  className = "h-8 w-8",
}: UserAvatarLinkProps) {
  const initial = name?.[0]?.toUpperCase() || "?";

  return (
    <Link to={`/profile/${userId}`} className="shrink-0">
      <Avatar className={`ring-2 ring-[#1877f2] dark:ring-blue-500 border-2 border-background shadow-xs transition-all duration-200 ${className}`}>
        <AvatarImage
          src={avatarUrl ?? undefined}
          alt={name ?? ""}
          className="object-cover"
        />
        <AvatarFallback className="bg-slate-100 text-xs font-bold">
          {initial}
        </AvatarFallback>
      </Avatar>
    </Link>
  );
}