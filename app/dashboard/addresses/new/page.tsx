import type { Metadata } from "next";
import AddressForm from "@/components/address/address-form";

export const metadata: Metadata = {
  title: "Add New Address",
  description: "Add a new delivery address to your account",
};

export default function NewAddressPage() {
  return (
    <div className="">
      <AddressForm />
    </div>
  );
}
