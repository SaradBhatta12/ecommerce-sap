"use client";

import { useState } from "react";
import Link from "next/link";
import { Bell, Search, Menu, User, LogOut, LogIn } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { AdminSidebar } from "./admin-sidebar";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "../ui/use-toast";
import { DropdownMenu } from "@radix-ui/react-dropdown-menu";
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";

import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

export function AdminHeader() {
  const router = useRouter();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { data: session, status } = useSession();

  const handleSignOut = async () => {
    router.push("/api/auth/signout");
    toast({
      title: "Signed Out",
      description: "You have been signed out successfully",
    });
  };

  return (
    <header className="bg-white dark:bg-[#0e162a] border-b border-gray-200 dark:border-gray-800">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex flex-1 items-center justify-end md:justify-between">
            <div className="flex items-center">
              {isSearchOpen ? (
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Search
                      className="h-4 w-4 text-gray-400"
                      aria-hidden="true"
                    />
                  </div>
                  <input
                    type="text"
                    className="block w-full rounded-md border-0 bg-white py-1.5 pl-10 pr-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 dark:bg-gray-700 dark:text-white dark:ring-gray-600"
                    placeholder="Search..."
                    autoFocus
                    onBlur={() => setIsSearchOpen(false)}
                  />
                </div>
              ) : (
                <button
                  type="button"
                  className="p-2 text-gray-500 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300"
                  onClick={() => setIsSearchOpen(true)}
                >
                  <span className="sr-only">Search</span>
                  <Search className="h-5 w-5" aria-hidden="true" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-4">
              <button
                type="button"
                className="relative p-2 text-gray-500 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300"
              >
                <span className="sr-only">View notifications</span>
                <Bell className="h-5 w-5" aria-hidden="true" />
                <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-gray-800" />
              </button>

              <ThemeToggle />

              <div className="relative ml-3">
                {status === "authenticated" ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-full relative overflow-hidden"
                        aria-label="User menu"
                      >
                        <Avatar className="h-8 w-8 ring-2 ring-primary/20 transition-all hover:ring-primary/50">
                          <AvatarImage
                            src={session.user?.image || ""}
                            alt={session.user?.name || "User"}
                          />
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {session.user?.name?.charAt(0) || "U"}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <div className="flex items-center justify-start gap-2 p-2">
                        <div className="flex flex-col space-y-1 leading-none">
                          {session.user?.name && (
                            <p className="font-medium">{session.user.name}</p>
                          )}
                          {session.user?.email && (
                            <p className="w-[200px] truncate text-sm text-muted-foreground">
                              {session.user.email}
                            </p>
                          )}
                        </div>
                      </div>
                      <DropdownMenuSeparator />

                      <DropdownMenuItem asChild>
                        <Link
                          href="/profile"
                          className="cursor-pointer text-red-500 focus:text-red-500"
                        >
                          Profile
                        </Link>
                      </DropdownMenuItem>

                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link
                          href="/api/auth/signout"
                          className="cursor-pointer text-red-500 focus:text-red-500"
                          onClick={handleSignOut}
                        >
                          Sign Out
                        </Link>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <Link href="/auth/signin">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="relative overflow-hidden group"
                      aria-label="Sign in"
                    >
                      <User className="h-5 w-5 transition-transform group-hover:scale-110" />
                      <span className="absolute inset-0 rounded-full bg-primary/10 scale-0 transition-transform group-hover:scale-100"></span>
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
