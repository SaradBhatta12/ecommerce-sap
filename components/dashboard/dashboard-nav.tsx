"use client";

import type React from "react";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import {
  Package,
  Heart,
  Settings,
  ShoppingBag,
  Star,
  Home,
  LogOut,
  Map,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { toast } from "sonner";
import { useParams } from "next/navigation";

interface DashboardNavProps extends React.HTMLAttributes<HTMLDivElement> {}

export function DashboardNav({ className, ...props }: DashboardNavProps) {
  const pathname = usePathname();


  const handleSignOut = () => {
    signOut({ callbackUrl: "/" });
    toast.success("Signed Out", {
      description: "You have been signed out successfully",
    });
  };

  const navItems = [
    {
      title: "Dashboard",
      href: `/dashboard`,
      icon: <Home className="mr-2 h-4 w-4" />,
    },
    {
      title: "Orders",
      href: `/dashboard/orders`,
      icon: <Package className="mr-2 h-4 w-4" />,
    },
    {
      title: "Wishlist",
      href: `/dashboard/wishlist`,
      icon: <Heart className="mr-2 h-4 w-4" />,
    },
    {
      title: "Reviews",
      href: `/dashboard/reviews`,
      icon: <Star className="mr-2 h-4 w-4" />,
    },
    {
      title: "Settings",
      href: `/dashboard/settings`,
      icon: <Settings className="mr-2 h-4 w-4" />,
    },
    {
      title: "Addresses",
      href: `/dashboard/addresses`,
      icon: <Map className="mr-2 h-4 w-4" />,
    },
  ];

  return (
    <nav className={cn("flex flex-col space-y-1 py-4", className)} {...props}>
      <div className="px-3 py-2">
        <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
          Dashboard
        </h2>
        <div className="space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                buttonVariants({ variant: "ghost" }),
                pathname === item.href
                  ? "bg-muted hover:bg-muted"
                  : "hover:bg-transparent hover:underline",
                "justify-start"
              )}
            >
              {item.icon}
              {item.title}
            </Link>
          ))}
        </div>
      </div>
      <div className="px-3 py-2">
        <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
          Account
        </h2>
        <div className="space-y-1">
          <Link
            href={`/`}
            className={cn(
              buttonVariants({ variant: "ghost" }),
              "hover:bg-transparent hover:underline",
              "justify-start"
            )}
          >
            <ShoppingBag className="mr-2 h-4 w-4" />
            Continue Shopping
          </Link>
          <button
            onClick={handleSignOut}
            className={cn(
              buttonVariants({ variant: "ghost" }),
              "hover:bg-transparent hover:underline",
              "justify-start w-full"
            )}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </button>
        </div>
      </div>
    </nav>
  );
}
