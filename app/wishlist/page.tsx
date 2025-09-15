"use client";

import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Heart, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function WishlistPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return; // Still loading
    
    if (!session) {
      // Redirect to login if not authenticated
      router.push("/auth/login?callbackUrl=/wishlist");
      return;
    }
  }, [session, status, router]);

  if (status === "loading") {
    return (
      <div className="container mx-auto py-10 px-4">
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <Loader2 className="h-8 w-8 animate-spin mb-4" />
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="container mx-auto py-10 px-4">
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <Heart className="h-16 w-16 text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold mb-2">Login Required</h1>
          <p className="text-muted-foreground mb-6 max-w-md">
            Please log in to view your wishlist.
          </p>
          <div className="flex gap-4">
            <Link href="/auth/login?callbackUrl=/wishlist">
              <Button>
                Login
              </Button>
            </Link>
            <Link href="/">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Redirect authenticated users to dashboard wishlist
  router.push("/dashboard/wishlist");
  
  return (
    <div className="container mx-auto py-10 px-4">
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <Loader2 className="h-8 w-8 animate-spin mb-4" />
        <p>Redirecting to your wishlist...</p>
      </div>
    </div>
  );
}
