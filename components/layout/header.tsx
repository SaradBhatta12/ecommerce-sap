"use client";

import type React from "react";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import {
  Search,
  ShoppingCart,
  Menu,
  User,
  Play,
  X,
  Home,
  Layers,
  Star,
  Heart,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSelector } from "react-redux";

function Header() {
  const [isClient, setIsClient] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  const cartItems = useSelector((state: any) => state?.cart?.items || []);
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  // Prevent hydration mismatch by ensuring client-side rendering
  useEffect(() => {
    setIsClient(true);
  }, []);

  const navLinks = [
    { name: "Home", href: "/", icon: Home },
    { name: "Collections", href: "/collections", icon: Layers },
    { name: "New Arrivals", href: "/new", icon: Star },
    { name: "Men", href: "/men", icon: User },
    { name: "Women", href: "/women", icon: User },
    { name: "Kids", href: "/kids", icon: Heart },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  // Don't render until client-side hydration is complete for critical interactive elements
  if (!isClient) {
    return (
      <header className="w-full bg-white border-b border-gray-200 sticky top-0 z-50 no-shadows no-rounded">
        <div className="fullscreen-container">
          <div className="flex h-20 items-center justify-between px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
            {/* Left side - Menu and Logo */}
            <div className="flex items-center gap-6">
              <Button
                variant="ghost"
                size="icon"
                className="p-2 hover:bg-gray-100 transition-colors duration-200"
                disabled
              >
                <Menu className="h-6 w-6" />
              </Button>
              <Link href="/" className="flex items-center gap-3">
                <div className="w-10 h-10 bg-black flex items-center justify-center">
                  <Play className="h-5 w-5 text-white fill-white" />
                </div>
                <div className="hidden sm:block">
                  <span className="text-2xl font-bold tracking-tight">XIV</span>
                  <span className="text-2xl font-light tracking-tight">QR</span>
                </div>
              </Link>
            </div>
            {/* Center - Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-8">
              <Link href="/" className="text-sm font-medium text-gray-900 hover:text-black transition-colors duration-200 uppercase tracking-wide">
                Home
              </Link>
              <Link href="/collections" className="text-sm font-medium text-gray-900 hover:text-black transition-colors duration-200 uppercase tracking-wide">
                Collections
              </Link>
              <Link href="/new" className="text-sm font-medium text-gray-900 hover:text-black transition-colors duration-200 uppercase tracking-wide">
                New
              </Link>
              <Link href="/men" className="text-sm font-medium text-gray-900 hover:text-black transition-colors duration-200 uppercase tracking-wide">
                Men
              </Link>
              <Link href="/women" className="text-sm font-medium text-gray-900 hover:text-black transition-colors duration-200 uppercase tracking-wide">
                Women
              </Link>
            </nav>
            {/* Right side - Icons */}
            <div className="flex items-center gap-2 sm:gap-4">
              <Button variant="ghost" size="icon" className="p-2 hover:bg-gray-100 transition-colors duration-200" disabled>
                <Search className="h-5 w-5" />
              </Button>
              <Link href="/cart">
                <Button variant="ghost" size="icon" className="p-2 hover:bg-gray-100 transition-colors duration-200 relative">
                  <ShoppingCart className="h-5 w-5" />
                  <span className="absolute -top-1 -right-1 bg-black text-white text-xs h-5 w-5 flex items-center justify-center font-medium">
                    0
                  </span>
                </Button>
              </Link>
              <Button variant="ghost" size="icon" className="p-2 hover:bg-gray-100 transition-colors duration-200" disabled>
                <User className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <>
      {/* Main Header */}
      <header className="w-full bg-white border-b border-gray-200 sticky top-0 z-50 no-shadows no-rounded" suppressHydrationWarning>
        <div className="fullscreen-container">
          <div className="flex h-20 items-center justify-between px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
            {/* Left side - Menu and Logo */}
            <div className="flex items-center gap-6">
              <Button
                variant="ghost"
                size="icon"
                className="p-2 hover:bg-gray-100 transition-colors duration-200"
                onClick={toggleSidebar}
              >
                <Menu className="h-6 w-6" />
              </Button>

              {/* Logo */}
              <Link href="/" className="flex items-center gap-3">
                <div className="w-10 h-10 bg-black flex items-center justify-center">
                  <Play className="h-5 w-5 text-white fill-white" />
                </div>
                <div className="hidden sm:block">
                  <span className="text-2xl font-bold tracking-tight">XIV</span>
                  <span className="text-2xl font-light tracking-tight">QR</span>
                </div>
              </Link>
            </div>

            {/* Center - Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-8">
              <Link href="/" className="text-sm font-medium text-gray-900 hover:text-black transition-colors duration-200 uppercase tracking-wide">
                Home
              </Link>
              <Link href="/collections" className="text-sm font-medium text-gray-900 hover:text-black transition-colors duration-200 uppercase tracking-wide">
                Collections
              </Link>
              <Link href="/new" className="text-sm font-medium text-gray-900 hover:text-black transition-colors duration-200 uppercase tracking-wide">
                New
              </Link>
              <Link href="/men" className="text-sm font-medium text-gray-900 hover:text-black transition-colors duration-200 uppercase tracking-wide">
                Men
              </Link>
              <Link href="/women" className="text-sm font-medium text-gray-900 hover:text-black transition-colors duration-200 uppercase tracking-wide">
                Women
              </Link>
            </nav>

            {/* Right side - Icons */}
            <div className="flex items-center gap-2 sm:gap-4">
              <Button
                variant="ghost"
                size="icon"
                className="p-2 hover:bg-gray-100 transition-colors duration-200"
                onClick={() => setIsSearchOpen(!isSearchOpen)}
              >
                <Search className="h-5 w-5" />
              </Button>
              <Link href="/cart">
                <Button variant="ghost" size="icon" className="p-2 hover:bg-gray-100 transition-colors duration-200 relative">
                  <ShoppingCart className="h-5 w-5" />
                  <span className="absolute -top-1 -right-1 bg-black text-white text-xs h-5 w-5 flex items-center justify-center font-medium">
                    {isClient ? (cartItems?.length || 0) : 0}
                  </span>
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                className="p-2 hover:bg-gray-100 transition-colors duration-200"
                onClick={() => router.push("/auth/login")}
              >
                <User className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Search Bar */}
          {isSearchOpen && (
            <div className="border-t border-gray-200 px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-4 bg-gray-50">
              <form onSubmit={handleSearch} className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="search"
                  placeholder="Search products..."
                  className="pl-10 bg-white border-gray-300 focus:border-black focus:ring-black"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </form>
            </div>
          )}
        </div>
      </header>

      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 transition-opacity duration-300"
          onClick={closeSidebar}
        />
      )}

      {/* Enhanced Sidebar */}
      <div className={`fixed top-0 left-0 w-full sm:w-[420px] lg:w-[480px] bg-white z-50 transform transition-all duration-500 ease-out no-shadows ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } backdrop-blur-sm`} suppressHydrationWarning>
        <div className="flex flex-col  relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <Image
              src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=1200&fit=crop&crop=center"
              alt="Background pattern"
              fill
              className="object-cover"
            />
          </div>

          {/* Sidebar Header */}
          <div className="relative flex items-center justify-between p-8 border-b border-gray-100">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-black flex items-center justify-center transform hover:scale-105 transition-transform duration-300">
                <Play className="h-6 w-6 text-white fill-white" />
              </div>
              <div className="font-display">
                <span className="text-2xl lg:text-3xl font-bold tracking-tight">XIV</span>
                <span className="text-2xl lg:text-3xl font-light tracking-tight text-gray-600">QR</span>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="p-3 hover:bg-gray-50 transition-all duration-300 hover:scale-110"
              onClick={closeSidebar}
            >
              <X className="h-6 w-6" />
            </Button>
          </div>

          {/* Featured Image Section */}
          <div className="relative h-32 sm:h-40 lg:h-48 overflow-hidden">
            <Image
              src="https://images.unsplash.com/photo-1445205170230-053b83016050?w=800&h=400&fit=crop&crop=center"
              alt="Featured collection"
              fill
              className="object-cover hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
            <div className="absolute bottom-4 left-6 text-white">
              <p className="text-sm font-light tracking-wide opacity-90">NEW COLLECTION</p>
              <p className="text-lg font-bold tracking-tight">SPRING 2024</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 px-6 py-8 relative">
            <div className="space-y-1">
              {navLinks.map((link, index) => {
                const Icon = link.icon;
                const isActive = isClient && pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`group flex items-center gap-5 px-6 py-4 text-lg font-medium transition-all duration-300 hover:bg-gray-50 hover:translate-x-2 ${
                      isActive ? 'bg-gray-50 text-black border-r-4 border-black translate-x-2' : 'text-gray-700 hover:text-black'
                      } font-display tracking-wide`}
                    onClick={closeSidebar}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <Icon className="h-6 w-6 group-hover:scale-110 transition-transform duration-300" />
                    <span className="text-base lg:text-lg">{link.name}</span>
                    <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="w-2 h-2 bg-black transform rotate-45" />
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Additional Links */}
            <div className="mt-12 pt-8 border-t border-gray-100">
              <div className="space-y-1">
                <Link
                  href="/wishlist"
                  className="group flex items-center gap-5 px-6 py-4 text-lg font-medium text-gray-700 hover:text-black hover:bg-gray-50 hover:translate-x-2 transition-all duration-300 font-display tracking-wide"
                  onClick={closeSidebar}
                >
                  <Heart className="h-6 w-6 group-hover:scale-110 group-hover:text-red-500 transition-all duration-300" />
                  <span className="text-base lg:text-lg">Wishlist</span>
                  <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="w-2 h-2 bg-black transform rotate-45" />
                  </div>
                </Link>
                <Link
                  href="/account"
                  className="group flex items-center gap-5 px-6 py-4 text-lg font-medium text-gray-700 hover:text-black hover:bg-gray-50 hover:translate-x-2 transition-all duration-300 font-display tracking-wide"
                  onClick={closeSidebar}
                >
                  <Settings className="h-6 w-6 group-hover:scale-110 group-hover:rotate-90 transition-all duration-300" />
                  <span className="text-base lg:text-lg">Account</span>
                  <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="w-2 h-2 bg-black transform rotate-45" />
                  </div>
                </Link>
              </div>
            </div>
          </nav>

          {/* Enhanced Sidebar Footer */}
          <div className="relative p-8 border-t border-gray-100 bg-gradient-to-r from-gray-50 to-white">
            <div className="flex items-center gap-4">
              <div className="relative w-16 h-16 overflow-hidden">
                <Image
                  src="https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=100&h=100&fit=crop&crop=center"
                  alt="Brand essence"
                  fill
                  className="object-cover hover:scale-110 transition-transform duration-500"
                />
              </div>
              <div className="font-display">
                <p className="text-lg font-bold tracking-tight text-black">XIV QR Fashion</p>
                <p className="text-sm font-light tracking-wide text-gray-600 mt-1">Modern. Minimal. Timeless.</p>
                <p className="text-xs font-medium tracking-wider text-gray-400 mt-2 uppercase">Est. 2024</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );



}

export default Header;
