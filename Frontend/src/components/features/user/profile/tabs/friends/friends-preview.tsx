import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface Friend {
  id: string;
  name: string;
  username?: string;
  avatarUrl?: string;
}

interface FriendsPreviewProps {
  friends?: Friend[];
  totalFriends?: number;
  onViewAll?: () => void;
  isLoading?: boolean;
}

const DUMMY_FRIENDS: Friend[] = [
  {
    id: "f1",
    name: "Alex Rivera",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
  },
  {
    id: "f2",
    name: "Sarah Chen",
    avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
  },
  {
    id: "f3",
    name: "Michael Scott",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
  },
  {
    id: "f4",
    name: "Emily Watson",
    avatarUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80",
  },
  {
    id: "f5",
    name: "David Kim",
    avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
  },
  {
    id: "f6",
    name: "Jessica Taylor",
    avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
  },
];

export const FriendsPreview = ({
  friends,
  totalFriends,
  onViewAll,
  isLoading = false,
}: FriendsPreviewProps) => {
  const activeFriends = friends && friends.length > 0 ? friends : DUMMY_FRIENDS;
  const activeTotalCount = totalFriends || activeFriends.length;
  const displayFriends = activeFriends.slice(0, 9);

  const formatTotalFriends = (count: number): string => {
    return count.toLocaleString();
  };

  if (isLoading) {
    return (
      <Card className="border-0 sm:border border-slate-200 dark:border-slate-800 shadow-none sm:shadow-sm bg-transparent sm:bg-card">
        <CardHeader className="pb-3 px-0 sm:px-6 pt-0 sm:pt-6">
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-4 w-24" />
          </div>
        </CardHeader>
        <CardContent className="px-0 sm:px-6 pb-0 sm:pb-6">
          {/* Mobile Skeleton */}
          <div className="flex sm:hidden gap-4 overflow-hidden pb-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center shrink-0 w-16 space-y-1">
                <Skeleton className="w-14 h-14 rounded-full" />
                <Skeleton className="h-3 w-12" />
              </div>
            ))}
          </div>
          {/* Desktop Skeleton */}
          <div className="hidden sm:grid grid-cols-3 gap-2">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="space-y-1">
                <Skeleton className="w-full aspect-square rounded-lg" />
                <Skeleton className="h-3 w-3/4 mx-auto" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="!space-y-0 sm:space-y-6">
      <Card className="border-0 sm:border border-slate-200 dark:border-slate-800 shadow-none sm:shadow-sm bg-transparent sm:bg-card hover:shadow-none sm:hover:shadow-md transition-shadow duration-200 !p-0 sm:!p-6">
        <CardHeader className="!p-0 !pb-2 sm:!p-0 sm:!pb-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold">Friends</h3>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {activeTotalCount > 0 ? `${formatTotalFriends(activeTotalCount)} friends` : ""}
              </span>
              <button
                onClick={onViewAll}
                className="text-sm font-semibold text-[#0061FF] hover:underline transition-colors"
              >
                See all friends
              </button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="!p-0 sm:!p-0">
          {/* Mobile view: Horizontal scrolling circular avatars without card frame */}
          <div className="flex sm:hidden overflow-x-auto gap-4 pb-2 scrollbar-none">
            {displayFriends.map((friend) => (
              <div
                key={friend.id}
                className="flex flex-col items-center shrink-0 w-16 cursor-pointer group"
                onClick={onViewAll}
              >
                <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-background ring-2 ring-primary/30 group-hover:ring-primary shadow-xs transition-all duration-200 group-hover:scale-105">
                  {friend.avatarUrl ? (
                    <img
                      src={friend.avatarUrl}
                      alt={friend.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-base font-bold">
                      {friend.name[0]?.toUpperCase()}
                    </div>
                  )}
                </div>
                <p className="text-[12px] font-medium text-slate-700 dark:text-slate-300 truncate w-full text-center mt-1">
                  {friend.name}
                </p>
              </div>
            ))}
          </div>

          {/* Desktop view: 3x3 grid */}
          <div className="hidden sm:grid grid-cols-3 gap-3">
            {displayFriends.map((friend) => (
              <div
                key={friend.id}
                className="group cursor-pointer text-center transition-transform duration-200 hover:scale-105"
              >
                <div className="w-full aspect-square relative rounded-lg overflow-hidden border-2 border-background ring-2 ring-primary/20 group-hover:ring-primary shadow-xs transition-all duration-200 mb-1.5">
                  {friend.avatarUrl ? (
                    <img
                      src={friend.avatarUrl}
                      alt={friend.name}
                      className="w-full h-full object-cover shadow-sm"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-lg font-bold">
                      {friend.name[0]?.toUpperCase()}
                    </div>
                  )}
                </div>
                <p className="text-[13px] font-semibold text-slate-600 dark:text-slate-400 truncate px-0.5">
                  {friend.name}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};