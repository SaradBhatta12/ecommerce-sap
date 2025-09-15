"use client";

import React, { useEffect, useState } from "react";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminHeader } from "@/components/admin/admin-header";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast, Toaster } from "sonner";
import { getAdminStore, updateStore } from "@/_actions/_admin";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [store, setStore] = useState<any>(null);
  const [formData, setFormData] = useState({
    storeName: "",
    businessType: "",
  });

  const businessTypes = [
    "Retail",
    "Wholesale",
    "E-Commerce",
    "Service-Based",
    "Manufacturing",
    "Education",
    "Healthcare",
    "Other",
  ];

  const getAdminAndStore = async () => {
    try {
      const res = await getAdminStore();
      if (res.success && res.store) {
        setStore(res.store);

        if (
          !res.store.vendorProfile?.storeName ||
          !res.store.vendorProfile?.businessType
        ) {
          setOpen(true);
          toast.warning("Please complete your business profile.");
        }
      } else {
        toast.error(res.message || "Store not found.");
        if (
          store?.vendorProfile?.storeName &&
          store?.vendorProfile?.businessType
        ) {
          setOpen(true);
        }
      }
    } catch (error) {
      console.error(error);
      toast.error("Internal Server Error");
      // setOpen(true);
    }
  };

  useEffect(() => {
    getAdminAndStore();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await updateStore(formData.storeName, formData.businessType);
      if (res.success) {
        toast.success(res.message);
        setOpen(false);
        setStore({ ...store, ...formData });
      } else {
        toast.error(res.message);
      }
    } catch (error) {
      console.error(error);
      toast.error("Internal Server Error");
    }
  };

  const handleClose = () => {
    // Update local store state and close form
    setStore({ ...store, ...formData });
    setOpen(false);
  };

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      {/* <Toaster position="top-center" theme="system" richColors /> */}

      <AdminSidebar />

      <div className="flex flex-col flex-1 overflow-hidden">
        <AdminHeader />

        <Dialog open={open} onOpenChange={() => {}}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Setup Your Business</DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="storeName">Business Name</Label>
                <Input
                  id="storeName"
                  name="storeName"
                  value={formData.storeName}
                  onChange={(e) =>
                    setFormData({ ...formData, storeName: e.target.value })
                  }
                  required
                />
              </div>

              <div>
                <Label>Business Type</Label>
                <Select
                  value={formData.businessType}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, businessType: value }))
                  }
                  required
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select business type" />
                  </SelectTrigger>
                  <SelectContent>
                    {businessTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end pt-4">
                <Button type="submit" className="w-full">
                  Save Business Info
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
