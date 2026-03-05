import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  LogOut,
  MessageCircle,
  PlusSquare,
  Settings,
  User,
} from "lucide-react";
import { Link } from "react-router-dom";
import { NotificationIcon } from "@/components/ui/notification";

// Import Redux hooks và action
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "@/stores";
import { logoutAction } from "@/stores/auth/auth.slice";

export const LoginDropdown = () => {
  // Lấy dispatch và thông tin user từ Redux store
  const dispatch = useDispatch(); // Dùng useDispatch<AppDispatch>() nếu có setup type
  const { user } = useSelector((state: RootState) => state.auth); // Dùng (state: RootState) nếu có setup type

  const handleLogout = () => {
    dispatch(logoutAction() as any); // Cast to any nếu chưa setup AppDispatch type
  };

  // Tạo chữ cái đầu cho Avatar Fallback (ví dụ: "John Doe" -> "JD" hoặc "J")
  const getInitials = (name?: string) => {
    if (!name) return "U";
    const parts = name.split(" ");
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name[0].toUpperCase();
  };

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-1 md:gap-3">
        <Button variant="ghost" className="h-12 w-12 hidden sm:flex">
          <PlusSquare className="size-6" />
        </Button>

        <Button variant="ghost" className="h-12 w-12">
          <MessageCircle className="size-6" />
        </Button>

        <Button variant="ghost" className="h-12 w-12">
          <NotificationIcon />
        </Button>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-9 w-9 rounded-full">
            <Avatar className="h-12 w-12">
              {/* Load avatar từ user data, nếu không có thì dùng ảnh mặc định */}
              <AvatarImage
                src={user?.avatarUrl || "/placeholder-user.jpg"}
                alt={user?.firstName || "User avatar"}
              />
              <AvatarFallback>{getInitials(user?.firstName)}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              {/* Hiển thị tên và email thật từ Redux */}
              <p className="text-sm font-medium leading-none">
                {user?.firstName || "Người dùng"}
              </p>
              <p className="text-xs leading-none text-muted-foreground">
                {user?.email || "Chưa cập nhật email"}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link
              to="/profile"
              className="cursor-pointer w-full flex items-center"
            >
              <User className="mr-2 h-4 w-4" /> Profile
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link
              to="/settings"
              className="cursor-pointer w-full flex items-center"
            >
              <Settings className="mr-2 h-4 w-4" /> Settings
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {/* Gắn sự kiện onClick gọi hàm handleLogout */}
          <DropdownMenuItem
            className="text-destructive cursor-pointer"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-4 w-4" /> Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
