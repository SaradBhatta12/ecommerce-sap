import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { getCurrentUser } from "@/lib/api-endpoints";
import { AddressEmptyState } from "@/components/address/address-empty";
import { AddressCard } from "@/components/address/address-card";
import User from "@/models/user";
import mongoose from "mongoose";
import dbConnect from "@/lib/db-connect";

export const metadata: Metadata = {
  title: "My Addresses",
  description: "Manage your delivery addresses",
};

// Define the address type based on the actual schema
type Address = {
  _id: string;
  fullName: string;
  address: string;
  district: string;
  province: string;
  postalCode?: string;
  phone: string;
  landmark?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  isDefault: boolean;
};

async function getAddresses(): Promise<Address[]> {
  try {
    await dbConnect(); // Make sure DB is connected

    const currentUser = await getCurrentUser();
    if (!currentUser?.user?.id) return [];

    const user = await User.findById(currentUser.user.id)
      .select("addresses")
      .lean();

    // Properly serialize addresses to plain objects
    const addresses = user?.addresses || [];
    return addresses.map((address: any) => ({
      _id: address._id.toString(),
      fullName: address.fullName,
      address: address.address,
      district: address.district,
      province: address.province,
      postalCode: address.postalCode || undefined,
      phone: address.phone,
      landmark: address.landmark || undefined,
      coordinates: address.coordinates ? {
        lat: address.coordinates.lat,
        lng: address.coordinates.lng
      } : undefined,
      isDefault: address.isDefault || false
    }));
  } catch (error) {
    console.error("Failed to load addresses:", error);
    return [];
  }
}

export default async function AddressesPage() {
  const addresses = await getAddresses();

  return (
    <div className="mx-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Addresses</h1>
          <p className="text-muted-foreground mt-1">
            Manage your delivery addresses
          </p>
        </div>

        <Link href="/dashboard/addresses/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add New Address
          </Button>
        </Link>
      </div>

      {addresses.length === 0 ? (
        <AddressEmptyState />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {addresses.map((address) => (
            <AddressCard key={address._id} address={address} />
          ))}
        </div>
      )}
    </div>
  );
}
