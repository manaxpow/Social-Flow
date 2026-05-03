import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MessageSquare, UserX, MoreHorizontal } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface Friend {
  id: string;
  name: string;
  avatarUrl?: string | null;
  username?: string;
}

interface FriendsTabProps {
  friends?: Friend[];
  isLoading?: boolean;
  isOwnProfile?: boolean;
}

export const FriendsTab = ({
  friends = [],
  isLoading = false,
  isOwnProfile = false,
}: FriendsTabProps) => {
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="text-xl font-semibold">Friends</div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-4 space-y-3">
                <div className="flex justify-center">
                  <Skeleton className="w-24 h-24 rounded-full" />
                </div>
                <Skeleton className="h-5 w-3/4 mx-auto" />
                <Skeleton className="h-9 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const handleSendMessage = (friendId: string) => {
    // TODO: Implement messaging functionality
    console.log("Send message to:", friendId);
  };

  const handleUnfriend = (friendId: string) => {
    if (window.confirm("Are you sure you want to unfriend this person?")) {
      // TODO: Implement unfriend functionality
      console.log("Unfriend:", friendId);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-xl font-semibold">
        Friends <span className="text-muted-foreground text-base ml-2">({friends.length})</span>
      </div>
      
      {friends.length === 0 ? (
        <Card className="shadow-sm">
          <CardContent className="py-12 text-center text-muted-foreground">
            No friends yet
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {friends.map((friend) => (
            <Card
              key={friend.id}
              className="overflow-hidden shadow-sm hover:shadow-md hover:border-[#0061FF]/30 transition-all duration-200 group"
            >
              <CardContent className="p-4 space-y-3">
                {/* Avatar */}
                <div className="flex justify-center">
                  <Avatar className="w-24 h-24 border-2 border-background">
                    {friend.avatarUrl ? (
                      <AvatarImage src={friend.avatarUrl} alt={friend.name} />
                    ) : null}
                    <AvatarFallback className="text-2xl bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                      {friend.name?.[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </div>

                {/* Name */}
                <div className="text-center space-y-1">
                  <h3 className="font-semibold text-sm truncate">{friend.name}</h3>
                  {friend.username && (
                    <p className="text-xs text-muted-foreground">@{friend.username}</p>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 hover:bg-[#00CFEE]/10 hover:border-[#00CFEE] hover:text-[#0061FF] transition-colors"
                    onClick={() => handleSendMessage(friend.id)}
                  >
                    <MessageSquare className="h-3 w-3 mr-1" />
                    Message
                  </Button>
                  
                  {isOwnProfile ? (
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 hover:bg-red-50 hover:border-red-300 hover:text-red-600 transition-colors"
                      onClick={() => handleUnfriend(friend.id)}
                    >
                      <UserX className="h-3 w-3 mr-1" />
                      Unfriend
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      className="px-2 hover:bg-slate-100 transition-colors"
                    >
                      <MoreHorizontal className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};