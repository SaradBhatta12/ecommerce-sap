"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MapPin, Plus } from "lucide-react";

export function AddressEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 border rounded-lg bg-muted/30">
      <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
        <MapPin className="h-10 w-10 text-primary" />
      </div>
      <h3 className="text-xl font-medium mb-2">No addresses found</h3>
      <p className="text-muted-foreground text-center max-w-md mb-6">
        You haven't added any delivery addresses yet. Add an address to make
        checkout faster.
      </p>
      <Link href={`/dashboard/addresses/new`}>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add New Address
        </Button>
      </Link>
    </div>
  );
}
