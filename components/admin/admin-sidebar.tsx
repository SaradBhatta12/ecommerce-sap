"use client";

import type React from "react";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  LineChart,
  Package,
  FolderTree,
  Tag,
  Percent,
  ShoppingCart,
  Users,
  PackageOpen,
  Truck,
  Glasses,
  Zap,
  MessagesSquare,
  ShieldCheck,
  Smartphone,
  Database,
  Bot,
  Workflow,
  Settings,
  ChevronRight,
  Menu,
  X,
  Moon,
  Sun,
  ChevronLeft,
  CircleEllipsisIcon,
  LocateFixedIcon,
} from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface NavItem {
  title: string;
  href: string;
  icon: React.ReactNode;
  isActive?: boolean;
}

export function AdminSidebar() {
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const navItems: NavItem[] = [
    {
      title: "Dashboard",
      href: "/admin",
      icon: <LayoutDashboard className="h-5 w-5" />,
      isActive: pathname === `/admin`,
    },
    {
      title: "Analytics & AI",
      href: "/admin/analytics",
      icon: <LineChart className="h-5 w-5" />,
      isActive: pathname === `/admin/analytics`,
    },
    {
      title: "Products",
      href: "/admin/products",
      icon: <Package className="h-5 w-5" />,
      isActive: pathname.startsWith(`/admin/products`),
    },
    {
      title: "Categories",
      href: "/admin/categories",
      icon: <FolderTree className="h-5 w-5" />,
      isActive: pathname.startsWith(`/admin/categories`),
    },

    {
      title: "Brands",
      href: "/admin/brands",
      icon: <Tag className="h-5 w-5" />,
      isActive: pathname.startsWith(`/admin/brands`),
    },
    {
      title: "Discounts & Promos",
      href: "/admin/discounts",
      icon: <Percent className="h-5 w-5" />,
      isActive: pathname.startsWith(`/admin/discounts`),
    },
    {
      title: "Orders",
      href: "/admin/orders",
      icon: <ShoppingCart className="h-5 w-5" />,
      isActive: pathname.startsWith(`/admin/orders`),
    },
    {
      title: "Customers",
      href: "/admin/customers",
      icon: <Users className="h-5 w-5" />,
      isActive: pathname.startsWith(`/admin/customers`),
    },
    {
      title: "User Management",
      href: "/admin/users",
      icon: <Users className="h-5 w-5" />,
      isActive: pathname.startsWith(`/admin/users`),
    },
    {
      title: "Inventory",
      href: "/admin/inventory",
      icon: <PackageOpen className="h-5 w-5" />,
      isActive: pathname.startsWith(`/admin/inventory`),
    },

    {
      title: "Locations & Shipping",
      href: "/admin/locations",
      icon: <LocateFixedIcon className="h-5 w-5" />,
      isActive: pathname.startsWith(`/admin/locations`),
    },
    {
      title: "Logistics & Delivery",
      href: "/admin/logistics",
      icon: <Truck className="h-5 w-5" />,
      isActive: pathname.startsWith(`/admin/logistics`),
    },
    {
      title: "AR/VR Experiences",
      href: "/admin/ar-vr",
      icon: <Glasses className="h-5 w-5" />,
      isActive: pathname.startsWith(`/admin/ar-vr`),
    },
    {
      title: "Automated Marketing",
      href: "/admin/marketing",
      icon: <Zap className="h-5 w-5" />,
      isActive: pathname.startsWith(`/admin/marketing`),
    },
    {
      title: "Customer Support AI",
      href: "/admin/support",
      icon: <MessagesSquare className="h-5 w-5" />,
      isActive: pathname.startsWith(`/admin/support`),
    },
    {
      title: "Security & Compliance",
      href: "/admin/security",
      icon: <ShieldCheck className="h-5 w-5" />,
      isActive: pathname.startsWith(`/admin/security`),
    },
    {
      title: "Mobile App Management",
      href: "/admin/mobile",
      icon: <Smartphone className="h-5 w-5" />,
      isActive: pathname.startsWith(`/admin/mobile`),
    },
    {
      title: "Data Management",
      href: "/admin/data",
      icon: <Database className="h-5 w-5" />,
      isActive: pathname.startsWith(`/admin/data`),
    },
    {
      title: "AI Integration",
      href: "/admin/ai",
      icon: <Bot className="h-5 w-5" />,
      isActive: pathname.startsWith(`/admin/ai`),
    },
    {
      title: "Workflow Automation",
      href: "/admin/workflow",
      icon: <Workflow className="h-5 w-5" />,
      isActive: pathname.startsWith(`/admin/workflow`),
    },
    {
      title: "Settings",
      href: "/admin/settings",
      icon: <Settings className="h-5 w-5" />,
      isActive: pathname.startsWith(`/admin/settings`),
    },
  ];

  // Enhanced theming variables with modern gradients and effects
  const sidebarBgClass = theme === "dark"
    ? "bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 backdrop-blur-xl"
    : "bg-gradient-to-b from-white via-gray-50 to-white backdrop-blur-xl shadow-xl";
  const textClass = theme === "dark" ? "text-white" : "text-gray-800";
  const subTextClass = theme === "dark" ? "text-gray-400" : "text-gray-500";
  const borderClass = theme === "dark"
    ? "border-slate-700/50 shadow-lg"
    : "border-gray-200/50 shadow-sm";
  const activeBgClass = theme === "dark"
    ? "bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg transform scale-105"
    : "bg-gradient-to-r from-blue-50 to-indigo-50 shadow-md transform scale-105";
  const inactiveTextClass =
    theme === "dark" ? "text-gray-400" : "text-gray-600";
  const hoverClass =
    theme === "dark"
      ? "hover:bg-gradient-to-r hover:from-slate-700 hover:to-slate-600 hover:text-white hover:shadow-lg hover:transform hover:scale-102 transition-all duration-300"
      : "hover:bg-gradient-to-r hover:from-gray-100 hover:to-gray-50 hover:text-gray-900 hover:shadow-md hover:transform hover:scale-102 transition-all duration-300";
  const userAvatarBgClass = theme === "dark"
    ? "bg-gradient-to-br from-blue-600 to-purple-600 shadow-lg"
    : "bg-gradient-to-br from-blue-100 to-indigo-100 shadow-md";
  const mobileButtonBgClass = theme === "dark" ? "bg-slate-800" : "bg-gray-100";
  const mobileButtonTextClass =
    theme === "dark" ? "text-white" : "text-gray-800";
  const toggleButtonClass =
    theme === "dark"
      ? "bg-slate-800 text-gray-300 hover:bg-slate-700 transition-all duration-200"
      : "bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all duration-200";

  // Desktop sidebar with collapsible functionality
  const DesktopSidebar = (
    <div
      className={cn(
        "hidden md:flex flex-col h-screen border-r transition-all duration-300 ease-in-out",
        sidebarBgClass,
        borderClass,
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      <div
        className={cn(
          "flex items-center border-b transition-all",
          borderClass,
          isCollapsed ? "justify-center p-4" : "justify-between p-4"
        )}
      >
        {!isCollapsed && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-sm">N</span>
            </div>
            <h2 className={cn("text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent", textClass)}>Naya Bazar</h2>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          className={cn("h-8 w-8", toggleButtonClass)}
          onClick={() => setIsCollapsed(!isCollapsed)}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className={cn("space-y-1", isCollapsed ? "px-1" : "px-2")}>
          <TooltipProvider delayDuration={300}>
            {navItems.map((item) => (
              <li key={item.title}>
                {isCollapsed ? (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link
                        href={item.href}
                        className={cn(
                          "flex items-center justify-center rounded-md p-2 transition-colors",
                          item.isActive
                            ? `${activeBgClass} ${textClass}`
                            : `${inactiveTextClass} ${hoverClass}`
                        )}
                      >
                        {item.icon}
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      <p>{item.title}</p>
                    </TooltipContent>
                  </Tooltip>
                ) : (
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                      item.isActive
                        ? `${activeBgClass} ${textClass}`
                        : `${inactiveTextClass} ${hoverClass}`
                    )}
                  >
                    {item.icon}
                    <span>{item.title}</span>
                    {item.isActive && (
                      <ChevronRight className="ml-auto h-4 w-4" />
                    )}
                  </Link>
                )}
              </li>
            ))}
          </TooltipProvider>
        </ul>
      </nav>

    </div>
  );

  // Mobile sidebar (using Sheet component)
  // Mobile sidebar with hamburger menu that shows either collapsed or expanded view
  const MobileSidebar = (
    <div className="md:hidden flex">
      {/* Hamburger menu button when sidebar is closed */}
      {!isOpen && (
        <button
          className={cn("p-2 rounded-md fixed left-2 top-4 ")}
          onClick={() => setIsOpen(true)}
          aria-label="Open menu"
        >
          <Menu className="h-6 w-6 text-gray-300" />
        </button>
      )}

      {/* Mobile sidebar when open */}
      {isOpen && (
        <div
          className={cn(
            "fixed inset-0 z-50 flex",
            isCollapsed ? "w-16" : "w-64"
          )}
        >
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />

          {/* Sidebar */}
          <div
            className={cn(
              "relative flex flex-col h-full transition-all duration-300 ease-in-out",
              sidebarBgClass,
              borderClass,
              isCollapsed ? "w-16" : "w-64"
            )}
          >
            <div
              className={cn(
                "flex items-center border-b",
                borderClass,
                isCollapsed ? "justify-center p-4" : "justify-between p-4"
              )}
            >
              {!isCollapsed && (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-sm">E</span>
                  </div>
                  <h2 className={cn("text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent", textClass)}>
                    Ecommerce Pro
                  </h2>
                </div>
              )}
              <div className="flex items-center gap-2">
                {!isCollapsed && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() =>
                      setTheme(theme === "dark" ? "light" : "dark")
                    }
                  >
                    {theme === "dark" ? (
                      <Sun className="h-4 w-4 text-yellow-400" />
                    ) : (
                      <Moon className="h-4 w-4" />
                    )}
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn("h-8 w-8", toggleButtonClass)}
                  onClick={() => setIsCollapsed(!isCollapsed)}
                >
                  {isCollapsed ? (
                    <ChevronRight className="h-4 w-4" />
                  ) : (
                    <ChevronLeft className="h-4 w-4" />
                  )}
                </Button>
                <button
                  className={cn(inactiveTextClass, "hover:", textClass)}
                  onClick={() => setIsOpen(false)}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            <nav className="flex-1 overflow-y-auto py-4">
              <ul className={cn("space-y-1", isCollapsed ? "px-1" : "px-2")}>
                <TooltipProvider delayDuration={300}>
                  {navItems.map((item) => (
                    <li key={item.title}>
                      {isCollapsed ? (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Link
                              href={item.href}
                              className={cn(
                                "flex items-center justify-center rounded-md p-2 transition-colors",
                                item.isActive
                                  ? `${activeBgClass} ${textClass}`
                                  : `${inactiveTextClass} ${hoverClass}`
                              )}
                              onClick={() => setIsOpen(false)}
                            >
                              {item.icon}
                            </Link>
                          </TooltipTrigger>
                          <TooltipContent side="right">
                            <p>{item.title}</p>
                          </TooltipContent>
                        </Tooltip>
                      ) : (
                        <Link
                          href={item.href}
                          className={cn(
                            "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                            item.isActive
                              ? `${activeBgClass} ${textClass}`
                              : `${inactiveTextClass} ${hoverClass}`
                          )}
                          onClick={() => setIsOpen(false)}
                        >
                          {item.icon}
                          <span>{item.title}</span>
                          {item.isActive && (
                            <ChevronRight className="ml-auto h-4 w-4" />
                          )}
                        </Link>
                      )}
                    </li>
                  ))}
                </TooltipProvider>
              </ul>
            </nav>
            <div
              className={cn(
                "border-t",
                borderClass,
                isCollapsed ? "p-2" : "p-4"
              )}
            >

            </div>
          </div>
        </div>
      )}
    </div>
  );

  if (!isMounted) {
    return null;
  }

  return (
    <>
      {DesktopSidebar}
      {MobileSidebar}
    </>
  );
}