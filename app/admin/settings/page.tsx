"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  getStoreInfo,
  updateStoreInfo,
} from "@/_actions/_admin";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function AdminSettings() {
  const [image, setImage] = useState<File | null>(null);
  const [description, setDescription] = useState("");
  const [name, setName] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [storeInfo, setStoreInfo] = useState<any>({});

  const getStoreInformations = async () => {
    try {
      const response = await getStoreInfo();
      if (response.success) {
        const store = JSON.parse(response.store as string);
        setStoreInfo(store);
        setName(store.vendorProfile?.storeName || "");
        setDescription(store.vendorProfile?.storeDescription || "");
        setBusinessType(store.vendorProfile?.businessType || "");
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong");
    }
  };

  // Fetch data when component mounts
  useEffect(() => {
    getStoreInformations();
  }, []);

  const handleUpdateAccount = async () => {
    try {
      const response = await updateStoreInfo(
        image as File,
        description,
        name,
        businessType
      );
      if (response.success) {
        toast.success(response.message);
        getStoreInformations();
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong");
    }
  };

  return (
    <div className="mx-auto">
      <h1 className="text-3xl font-bold mb-6">Profile Settings</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col space-y-4">
            <Avatar className="w-24 h-24">
              <AvatarImage
                src={storeInfo?.vendorProfile?.logo}
                alt="Profile Picture"
              />
              <AvatarFallback>
                {name ? name.charAt(0).toUpperCase() : "AD"}
              </AvatarFallback>
            </Avatar>
            <div>
              <Label htmlFor="avatar-upload">Upload Profile Picture</Label>
              <Input
                id="avatar-upload"
                type="file"
                accept="image/*"
                onChange={(e) => setImage(e.target.files?.[0] as File)}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="store-name">Name</Label>
            <Input
              id="store-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
            />
          </div>

          <div>
            <Label htmlFor="store-description">Description</Label>
            <Input
              id="store-description"
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter a brief description"
            />
          </div>

          <div>
            <Label htmlFor="business-type">Business Type</Label>
            <Input
              id="business-type"
              type="text"
              value={businessType}
              onChange={(e) => setBusinessType(e.target.value)}
              placeholder="Enter business type"
            />
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={storeInfo?.email || ""}
              readOnly
              disabled
            />
          </div>

          <Button onClick={handleUpdateAccount} className="w-full">
            Update Profile
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
