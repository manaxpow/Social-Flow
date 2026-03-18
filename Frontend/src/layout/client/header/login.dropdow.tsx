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

export const LoginDropdown = () => {
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
              <AvatarImage src="/placeholder-user.jpg" alt="User" />
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">John Doe</p>
              <p className="text-xs leading-none text-muted-foreground">
                john.doe@example.com
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
          <DropdownMenuItem className="text-destructive cursor-pointer">
            <LogOut className="mr-2 h-4 w-4" /> Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
