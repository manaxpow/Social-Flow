import { MapPin, Link as LinkIcon, Calendar, Edit, Settings, UserPlus, MoreHorizontal, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AvatarUploader } from "./avatar-uploader";
import { CoverUploader } from "./cover-uploader";
import type { UserResponse } from "@/services/user/dtos/user.reponse";
import type { PostDetailResponse } from "@/services/post/dtos/response/post-detail.response";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

interface ProfileHeaderProps {
  user?: UserResponse | null;
  location?: string;
  website?: string;
  isLoading?: boolean;
  posts?: PostDetailResponse[];
}

export const ProfileHeader = ({
  user,
  location,
  website,
  isLoading = false,
  posts = [],
}: ProfileHeaderProps) => {
  const navigate = useNavigate();

  // State for cover URL to update after upload
  const [localCoverUrl, setLocalCoverUrl] = useState<string | undefined>(user?.coverUrl);

  // Sync localCoverUrl when user.coverUrl changes (e.g., after upload)
  useEffect(() => {
    if (user?.coverUrl !== localCoverUrl) {
      setLocalCoverUrl(user?.coverUrl);
    }
  }, [user?.coverUrl]);

  // Ref to trigger cover upload from camera button
  const coverUploadTriggerRef = useRef<(() => void) | null>(null);

  // Find the most recent avatarUpdate and coverUpdate posts
  const avatarUpdatePost = posts.find((p) => p.type === "avatarUpdate");
  const coverUpdatePost = posts.find((p) => p.type === "coverUpdate");

  // Default cover gradients based on user ID
  const DEFAULT_COVER_GRADIENTS = [
    "from-blue-400 to-purple-600",
    "from-green-400 to-cyan-600",
    "from-orange-400 to-red-600",
    "from-pink-400 to-rose-600",
    "from-indigo-400 to-violet-600",
    "from-teal-400 to-emerald-600",
  ];

  const getGradientForUser = (userId: string | undefined): string => {
    if (!userId) return DEFAULT_COVER_GRADIENTS[0];
    const hash = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return DEFAULT_COVER_GRADIENTS[hash % DEFAULT_COVER_GRADIENTS.length];
  };

  // Optimize Cloudinary URL with f_auto,q_auto
  const getOptimizedCoverUrl = (url: string | undefined): string | undefined => {
    if (!url) return undefined;
    return url.replace(
      /https:\/\/res\.cloudinary\.com\/[^\/]+\/image\/upload\//,
      (match) => match + "f_auto,q_auto/"
    );
  };

  // Map UserResponse to component variables
  const name = user?.fullName || "User Name";
  const username = user?.email ? user.email.split('@')[0] : undefined;
  const avatarUrl = user?.avatarUrl;
  const coverUrl = localCoverUrl ?? user?.coverUrl;
  const optimizedCoverUrl = getOptimizedCoverUrl(coverUrl);
  const bio = user?.bio;
  const joinedDate = user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : undefined;
  const followingCount = user?.followingCount || 0;
  const followerCount = user?.followersCount || 0;
  const defaultGradient = getGradientForUser(user?.id);

  if (isLoading) {
    return (
      <div className="max-w-[1600px] mx-auto bg-background">
        {/* Cover Skeleton */}
        <div className="h-64 md:h-80 lg:h-96 bg-slate-200">
          <Skeleton className="w-full h-full" />
        </div>

        {/* Avatar Skeleton */}
        <div className="relative -bottom-20 left-6 md:left-12 ring-4 ring-background rounded-full overflow-hidden">
          <Skeleton className="w-36 h-36 md:w-48 md:h-48" />
        </div>

        {/* Action Buttons Skeleton */}
        <div className="flex justify-end p-4 pt-6 gap-2">
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-10 w-36 rounded-full" />
          <Skeleton className="h-10 w-36 rounded-full" />
        </div>

        {/* User Info Skeleton */}
        <div className="px-6 mt-8 space-y-4">
          <div className="space-y-1">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
          <Skeleton className="h-16 w-full" />
          <div className="flex gap-6">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-5 w-24" />
          </div>
        </div>
      </div>
    );
  }

  // Format follower count (e.g., 48.5k)
  const formatCount = (count: number): string => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toString();
  };

  return (
    <div className="max-w-[1600px] mx-auto bg-background pb-0">
      {/* 1. Header & Cover Image with Gradient */}
      <div className="relative">
        <CoverUploader
          onCoverUpdate={setLocalCoverUrl}
          onPreview={() => coverUpdatePost && navigate(`/post/${coverUpdatePost.id}`)}
          triggerUploadRef={coverUploadTriggerRef}
        >
          <div className="relative group">
            <div className="h-80 md:h-96 lg:h-[500px] bg-slate-200 overflow-hidden">
              {/* Default Gradient (only when no cover image) */}
              {!coverUrl && (
                <div className={`absolute inset-0 bg-gradient-to-r ${defaultGradient}`} />
              )}
              
              {/* Cover Image or Default Placeholder */}
              <img
                src={optimizedCoverUrl ?? "https://images.unsplash.com/photo-1557683316-973673baf926"}
                alt="Cover"
                className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${!coverUrl ? 'opacity-30' : ''}`}
                style={{ objectFit: coverUrl ? 'cover' : 'contain' }}
              />

              {/* Camera Button - Top Right */}
              <div className="absolute top-4 right-4 z-20">
                <Button
                  variant="secondary"
                  size="sm"
                  className="rounded-full bg-black/50 hover:bg-black/70 text-white backdrop-blur-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    coverUploadTriggerRef.current?.();
                  }}
                >
                  <Camera className="h-4 w-4 mr-2" />
                  Upload Cover
                </Button>
              </div>

            </div>
          </div>
        </CoverUploader>

        {/* Avatar - Positioned outside CoverUploader to avoid hover conflict */}
        <div className="absolute -bottom-20 left-6 md:left-12 ring-4 ring-background rounded-full group/avatar z-10">
          <AvatarUploader
            currentAvatar={avatarUrl ?? undefined}
            initials={name?.[0]?.toUpperCase() ?? "U"}
            size="large"
            onPreview={() => avatarUpdatePost && navigate(`/post/${avatarUpdatePost.id}`)}
          />
        </div>
      </div>

      {/* 2. Action Buttons */}
      <div className="flex justify-end p-4 pt-10 gap-2">
        <Button variant="outline" size="icon" className="rounded-full hover:bg-slate-100 transition-colors w-10 h-10">
          <Settings className="h-6 w-6" />
        </Button>
        <Button variant="outline" size="icon" className="rounded-full hover:bg-slate-100 transition-colors w-10 h-10">
          <MoreHorizontal className="h-6 w-6" />
        </Button>
        <Button className="rounded-full px-6 py-2 font-semibold bg-[#00CFEE] hover:bg-[#00B8DD] text-white transition-colors h-10">
          <UserPlus className="h-6 w-6 mr-2" />
          Add to Story
        </Button>
        <Button className="rounded-full px-6 py-2 font-semibold bg-[#0061FF] hover:bg-[#0050DD] text-white transition-colors h-10">
          <Edit className="h-6 w-6 mr-2" />
          Edit Profile
        </Button>
      </div>

      {/* 3. User Info */}
      <div className="px-6 md:px-12 lg:px-16 mt-8 space-y-3 pb-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">{name}</h1>
          {username && (
            <p className="text-muted-foreground text-base">@{username}</p>
          )}
        </div>

        {bio && (
          <p className="text-base leading-relaxed max-w-2xl">{bio}</p>
        )}

        {/* Metadata (Location, Link, Join Date) */}
        {(location || website || joinedDate) && (
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-base text-muted-foreground">
            {location && (
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" /> {location}
              </div>
            )}
            {website && (
              <div className="flex items-center gap-1 text-primary hover:underline cursor-pointer">
                <LinkIcon className="h-4 w-4" /> {website}
              </div>
            )}
            {joinedDate && (
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" /> {joinedDate}
              </div>
            )}
          </div>
        )}

        {/* Following/Followers Stats - Clickable */}
        <div className="flex gap-6 text-base">
          <div className="flex gap-1 cursor-pointer hover:underline hover:text-[#0061FF] transition-colors">
            <span className="font-semibold text-foreground">{formatCount(followingCount)}</span>
            <span className="text-muted-foreground">Following</span>
          </div>
          <div className="flex gap-1 cursor-pointer hover:underline hover:text-[#0061FF] transition-colors">
            <span className="font-semibold text-foreground">{formatCount(followerCount)}</span>
            <span className="text-muted-foreground">Followers</span>
          </div>
        </div>
      </div>
    </div>
  );
};
