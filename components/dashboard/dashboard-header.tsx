"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, User, LogOut, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSession, signOut } from "next-auth/react";
import { DashboardNav } from "@/components/dashboard/dashboard-nav";
import { useTheme } from "next-themes";
import { useToast } from "@/components/ui/use-toast";

export function DashboardHeader() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    toast({
      title: `Theme Changed`,
      description: `Switched to ${newTheme} mode`,
    });
  };

  const handleSignOut = () => {
    signOut({ callbackUrl: "/" });
    toast({
      title: "Signed Out",
      description: "You have been signed out successfully",
    });
  };

  return (
    <header className="sticky top-0 z-40 border-b bg-background">
      <div className=" flex h-16 items-center justify-between py-4 px-4">
        <div className="flex items-center gap-4">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[240px] sm:w-[280px]">
              <DashboardNav />
            </SheetContent>
          </Sheet>
          <Link href="/" className="flex items-center space-x-2">
            <span className="font-bold text-xl">NepalMart</span>
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={toggleTheme}>
            {theme === "dark" ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>
          <div className="flex items-center gap-2">
            {session?.user ? (
              <>
                <span className="hidden md:inline-block text-sm font-medium">
                  {session.user.name || session.user.email}
                </span>
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    src={session.user.image || ""}
                    alt={session.user.name || "User"}
                  />
                  <AvatarFallback>
                    {session.user.name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <Button variant="ghost" size="icon" onClick={handleSignOut}>
                  <LogOut className="h-5 w-5" />
                  <span className="sr-only">Sign Out</span>
                </Button>
              </>
            ) : (
              <Link href="/auth/login">
                <Button variant="ghost" size="icon">
                  <User className="h-5 w-5" />
                  <span className="sr-only">Sign In</span>
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
