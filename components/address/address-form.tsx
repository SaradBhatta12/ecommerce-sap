"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Loader2, Navigation } from "lucide-react";
import LocationPicker from "./location-picker";
import ImprovedAddressPicker from './improved-address-picker';

import { useGetLocationTreeQuery, useGetLocationsByParentQuery } from '@/store/api/locationApi';

interface AddressFormProps {
  initialData?: {
    _id?: string;
    fullName: string;
    city: string;
    province: string;
    postalCode: string;
    phone: string;
    landmark?: string;
    locality?: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
    isDefault?: boolean;
  };
}

export default function AddressForm({ initialData }: AddressFormProps) {
  const router = useRouter();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedProvince, setSelectedProvince] = useState<string>(
    initialData?.province || ""
  );
  const [selectedDistrict, setSelectedDistrict] = useState<string>(
    initialData?.city || ""
  );
  const [selectedLocality, setSelectedLocality] = useState<string>(
    initialData?.locality || ""
  );
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [showAddressPicker, setShowAddressPicker] = useState(false);

  const [formData, setFormData] = useState({
    fullName: initialData?.fullName || "",
    city: initialData?.city || "",
    district: initialData?.city || "",
    province: initialData?.province || "",
    postalCode: initialData?.postalCode || "",
    phone: initialData?.phone || "",
    landmark: initialData?.landmark || "",
    locality: initialData?.locality || "",
    coordinates: initialData?.coordinates || { lat: 0, lng: 0 },
    isDefault: initialData?.isDefault || false,
  });

  // Fetch location data from API
  const { data: locationTree, isLoading: isLoadingTree } = useGetLocationTreeQuery();
  const { data: apiProvinces, isLoading: isLoadingProvinces } = useGetLocationsByParentQuery(null);
  const { data: apiDistricts, isLoading: isLoadingDistricts } = useGetLocationsByParentQuery(
    formData.province || null,
    { skip: !formData.province }
  );
  const { data: apiLocalities, isLoading: isLoadingLocalities } = useGetLocationsByParentQuery(
    formData.district || null,
    { skip: !formData.district }
  );



  const handleProvinceChange = (value: string) => {
    setSelectedProvince(value);
    setFormData((prev) => ({
      ...prev,
      province: value,
      district: '',
      locality: ''
    }));
    setSelectedDistrict("");
    setSelectedLocality("");
  };

  const handleDistrictChange = (value: string) => {
    setSelectedDistrict(value);
    setFormData((prev) => ({
      ...prev,
      city: value,
      district: value,
      locality: ''
    }));
    setSelectedLocality("");
  };

  const handleLocalityChange = (value: string) => {
    setSelectedLocality(value);
    setFormData((prev) => ({ ...prev, locality: value }));
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, isDefault: checked }));
  };

  const handleLocationSelect = (lat: number, lng: number) => {
    setFormData((prev) => ({ ...prev, coordinates: { lat, lng } }));
    setShowLocationPicker(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const phoneRegex = /^(9[678]\d{8})$/;
    if (!phoneRegex.test(formData.phone)) {
      return toast.error("Invalid Phone Number", {
        description: "Enter valid Nepali number",
      });
    }

    if (formData.postalCode && !/^\d{5}$/.test(formData.postalCode)) {
      return toast.error("Invalid Postal Code", {
        description: "Postal code must be 5 digits",
      });
    }

    try {
      setIsSubmitting(true);

      const url = initialData?._id
        ? `/api/user/addresses/${initialData._id}`
        : "/api/user/addresses";

      const method = initialData?._id ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        return toast.error("Error", {
          description: result.error || "Failed to save address",
        });
      }

      toast.success("Success", {
        description: initialData ? "Address updated" : "Address added",
      });
      router.push(`/dashboard/addresses`);
      router.refresh();
    } catch (error: any) {
      console.error(error);
      toast.error("Error", {
        description: error.message || "Something went wrong",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>
          {initialData ? "Edit Address" : "Add New Address"}
        </CardTitle>
        <CardDescription>
          {initialData
            ? "Update your delivery address"
            : "Add a new delivery address to your account"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Mobile Number</Label>
              <Input
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="98xxxxxxxx"
                required
              />
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Location</Label>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddressPicker(true)}
                  className="w-full justify-start h-auto p-4"
                >
                  <div className="flex items-start gap-3">
                    <Navigation className="h-5 w-5 mt-0.5 text-muted-foreground" />
                    <div className="text-left">
                      {formData.province || formData.district || formData.locality ? (
                        <div>
                          <div className="font-medium">
                            {[formData.locality, formData.district, formData.province].filter(Boolean).join(', ')}
                          </div>
                          <div className="text-sm text-muted-foreground mt-1">
                            Click to change location
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div className="font-medium">Select Location</div>
                          <div className="text-sm text-muted-foreground mt-1">
                            Choose your province, district, and locality
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </Button>
              </div>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="landmark">Landmark</Label>
              <Textarea
                id="landmark"
                name="landmark"
                value={formData.landmark}
                onChange={handleInputChange}
                placeholder="Near XYZ"
                className="resize-none"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="postalCode">Postal Code</Label>
              <Input
                id="postalCode"
                name="postalCode"
                value={formData.postalCode}
                onChange={handleInputChange}
                placeholder="e.g. 44600"
              />
            </div>
            <div className="space-y-2">
              <Label>Location</Label>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowLocationPicker(true)}
              >
                <Navigation className="mr-2 h-4 w-4" />
                {formData.coordinates.lat !== 27.7172
                  ? "Change Location"
                  : "Pick on Map"}
              </Button>
              {formData.coordinates.lat !== 27.7172 && (
                <p className="text-xs text-muted-foreground">
                  {formData.coordinates.lat.toFixed(4)},{" "}
                  {formData.coordinates.lng.toFixed(4)}
                </p>
              )}
            </div>
            <div className="flex items-center space-x-2 md:self-end">
              <Checkbox
                id="isDefault"
                checked={formData.isDefault}
                onCheckedChange={handleCheckboxChange}
              />
              <Label htmlFor="isDefault">Set as default address</Label>
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/dashboard/addresses")}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                  {initialData ? "Updating..." : "Saving..."}
                </>
              ) : initialData ? (
                "Update Address"
              ) : (
                "Save Address"
              )}
            </Button>
          </div>
        </form>

        {showLocationPicker && (
          <LocationPicker
            initialLocation={formData.coordinates}
            onSelect={handleLocationSelect}
            onCancel={() => setShowLocationPicker(false)}
          />
        )}
      </CardContent>
    </Card>
  );
}
