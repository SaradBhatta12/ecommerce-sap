import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/api-endpoints";
import AddressForm from "@/components/address/address-form";
import User from "@/models/user";
import dbConnect from "@/lib/db-connect";

export const metadata: Metadata = {
  title: "Edit Address",
  description: "Edit your delivery address",
};

// Define the address type
type Address = {
  _id: string;
  fullName: string;
  address: string;
  district: string;
  province: string;
  postalCode?: string;
  phone: string;
  alternatePhone?: string;
  landmark?: string;
  addressType?: string;
  locality?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  isDefault: boolean;
};

async function getAddress(addressId: string): Promise<Address | null> {
  try {
    await dbConnect();

    const currentUser = await getCurrentUser();
    if (!currentUser?.user?.id) return null;

    const user = await User.findById(currentUser.user.id)
      .select("addresses")
      .lean();

    if (!user?.addresses) return null;

    const address = user.addresses.find((addr: any) => 
      addr._id.toString() === addressId
    );

    if (!address) return null;

    // Serialize the address to plain object
    return {
      _id: address._id.toString(),
      fullName: address.fullName,
      address: address.address,
      district: address.district,
      province: address.province,
      postalCode: address.postalCode || undefined,
      phone: address.phone,
      alternatePhone: address.alternatePhone || undefined,
      landmark: address.landmark || undefined,
      addressType: address.addressType || undefined,
      locality: address.locality || undefined,
      coordinates: address.coordinates ? {
        lat: address.coordinates.lat,
        lng: address.coordinates.lng
      } : undefined,
      isDefault: address.isDefault || false
    };
  } catch (error) {
    console.error("Failed to load address:", error);
    return null;
  }
}

interface EditAddressPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditAddressPage({ params }: EditAddressPageProps) {
  const { id } = await params;
  const address = await getAddress(id);

  if (!address) {
    notFound();
  }

  return (
    <div className="mx-4 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Edit Address</h1>
        <p className="text-muted-foreground mt-1">
          Update your delivery address information
        </p>
      </div>

      <AddressForm 
        initialData={address}
      />
    </div>
  );
}