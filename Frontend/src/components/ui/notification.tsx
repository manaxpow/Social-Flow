import { Heart } from "lucide-react";
import { Badge } from "@/components/ui/badge"; // [!code ++]

export const NotificationIcon = () => {
  const notificationCount = 5;

  return (
    <div className="relative">
      <Heart className="size-6" />

      {notificationCount > 0 && (
        <Badge
          variant="destructive"
          className="absolute -top-2 -right-3 h-5 w-5 flex items-center justify-center rounded-full p-0 text-[10px] border-2 border-background"
        >
          {notificationCount > 9 ? "9+" : notificationCount}
        </Badge>
      )}
    </div>
  );
};
