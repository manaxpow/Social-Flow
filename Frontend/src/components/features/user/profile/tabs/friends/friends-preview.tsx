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

export const FriendsPreview = ({ 
  friends = [], 
  totalFriends = 0,
  onViewAll,
  isLoading = false
}: FriendsPreviewProps) => {
  const displayFriends = friends.slice(0, 9);

  const formatTotalFriends = (count: number): string => {
    return count.toLocaleString();
  };

  if (isLoading) {
    return (
      <Card className="border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow duration-200">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-4 w-24" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-2">
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

  if (displayFriends.length === 0) {
    return (
      <Card className="border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow duration-200">
        <CardHeader className="pb-3">
          <h3 className="text-xl font-semibold">Friends</h3>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <p className="text-sm">Chưa có bạn bè</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow duration-200">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold">Friends</h3>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {totalFriends > 0 ? `${formatTotalFriends(totalFriends)} friends` : ""}
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
        <CardContent>
          <div className="grid grid-cols-3 gap-3">
            {displayFriends.map((friend) => (
             <div key={friend.id} className="group cursor-pointer text-center transition-transform duration-200 hover:scale-105">
            <div className="w-full aspect-square relative rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 mb-1.5">
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