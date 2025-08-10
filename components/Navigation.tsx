import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Badge } from "./ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { kmgmedia} from "./ui/assets"; // use the actual file extension
import { ThemeToggle } from "./ThemeToggle";
import { UserProfile } from "./UserProfile";
import { NewProjectDialog } from "./NewProjectDialog";
import { useAuth } from "../contexts/AuthContext";
import { Search, Plus, LogOut, User, Users, Settings } from "lucide-react";

export function Navigation() {
  const [searchQuery, setSearchQuery] = useState("");
  const { user, signOut, isDemoMode, demoUsers } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  const userInitials = user?.user_metadata?.name
    ? user.user_metadata.name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
    : user?.email?.substring(0, 2).toUpperCase() || "U";

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-white">
      <div className="container mx-auto px-6">
        <div className="flex h-16 items-center justify-between">
          {/* Left section - Logo and brand */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-80 h-80 flex items-center justify-right">
                <img
                  src={kmgmedia}
                  alt="Logo"
                  width={100}
                  height={100}
                  className=""
                />
              </div>
              <div className="flex flex-col">
                <span className="font-medium">Dashboard</span>
              </div>
            </div>

            {/* Navigation links */}
            <div className="hidden md:flex items-center gap-6">
              <a
                href="#"
                className="text-sm font-medium hover:text-primary transition-colors"
              >
                Overview
              </a>
              <a
                href="#"
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Projects
              </a>
              <a
                href="#"
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Analytics
              </a>
              <a
                href="#"
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Reports
              </a>
            </div>
          </div>

          {/* Center section - Search */}
          <div className="flex-1 max-w-md mx-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="search"
                placeholder="Search projects..."
                className="pl-9 pr-4"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Right section - Actions and user menu */}
          <div className="flex items-center gap-4">
            {/* New Project Button */}
            <div className="hidden sm:block">
              <NewProjectDialog
                trigger={
                  <Button
                    size="sm"
                    className="flex items-center gap-2 bg-black text-white hover:bg-black/90"
                  >
                    <Plus className="h-4 w-4" />
                    New Project
                  </Button>
                }
              />
            </div>

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-8 w-8 rounded-full p-0"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-sm">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-80" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-2">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium leading-none">
                        {user?.user_metadata?.name || "Unknown User"}
                      </p>
                      {isDemoMode && (
                        <Badge variant="outline" className="text-xs">
                          Pro
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.email}
                    </p>
                    {isDemoMode && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Users className="h-3 w-3" />
                        {demoUsers.length} demo account
                        {demoUsers.length !== 1 ? "s" : ""} total
                      </div>
                    )}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />

                {/* Profile Management */}
                <DropdownMenuItem asChild className=" bg-white cursor-pointer">
                  <div>
                    <UserProfile />
                  </div>
                </DropdownMenuItem>

                <DropdownMenuItem asChild className="cursor-pointer sm:hidden">
                  <div>
                    <NewProjectDialog
                      trigger={
                        <Button
                          variant="ghost"
                          className="w-full justify-start p-2 h-auto"
                        >
                          <Plus className="bg-white mr-2 h-4 w-4" />
                          <span>New Project</span>
                        </Button>
                      }
                    />
                  </div>
                </DropdownMenuItem>

                <DropdownMenuItem className="cursor-pointer">
                  <Settings className="bg-white mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>

                {isDemoMode && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem disabled>
                      <User className=" bg-white mr-2 h-4 w-4" />
                      <span>Pro Mode Active</span>
                    </DropdownMenuItem>
                  </>
                )}

                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer text-red-600 focus:text-red-600"
                  onClick={handleSignOut}
                >
                  <LogOut className=" bg-white mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  );
}
