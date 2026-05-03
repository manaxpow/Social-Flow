import { Link } from "react-router-dom";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoginDropdown } from "./login.dropdow";
import { useAppSelector } from "@/stores/hook";

export function Header() {
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);

  return (
    <header className="sticky top-0 z-50 w-full px-5 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container-fluid flex h-16 items-center justify-between">
        {/* Logo Section */}
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-xl md:text-2xl font-bold tracking-tight text-primary">
              SocialFlow
            </span>
          </Link>
        </div>

        {/* Search Bar (Centered on Desktop) */}
        <div className="hidden md:flex relative w-full max-w-sm items-center">
          <Search className="absolute left-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search in SocialFlow..."
            className="pl-8 bg-muted/50"
          />
        </div>

        {/* Navigation & User Actions */}
        <nav className="flex items-center gap-4">
          {isAuthenticated ? (
            <LoginDropdown user={user} />
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" asChild>
                <Link to="/auth/login">Login</Link>
              </Button>
              <Button asChild>
                <Link to="/auth/register">Register</Link>
              </Button>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}