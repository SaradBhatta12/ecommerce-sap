"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function WishlistPage() {
  return (
    <div className="container mx-auto py-10 px-4">
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="animate-bounce mb-4">
          <Heart className="h-16 w-16 text-muted-foreground" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Wishlist Functionality Removed</h1>
        <p className="text-muted-foreground mb-6 max-w-md">
          The wishlist functionality has been temporarily removed. Please check back later or contact support for assistance.
        </p>
        <div className="flex gap-4">
          <Link href="/">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
