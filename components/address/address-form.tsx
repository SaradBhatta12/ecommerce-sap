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
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Navigation } from "lucide-react";
import LocationPicker from "./location-picker";
import {
  nepalProvinces,
  districtsByProvince,
  localitiesByDistrict,
} from "@/lib/nepal-data";

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
  const { domain } = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedProvince, setSelectedProvince] = useState<string>(
    initialData?.province
      ? nepalProvinces.find((p) => p.name === initialData.province)?.id || ""
      : ""
  );
  const [districts, setDistricts] = useState<string[]>([]);
  const [selectedDistrict, setSelectedDistrict] = useState<string>(
    initialData?.city || ""
  );
  const [localities, setLocalities] = useState<string[]>([]);
  const [selectedLocality, setSelectedLocality] = useState<string>(
    initialData?.locality || ""
  );
  const [showLocationPicker, setShowLocationPicker] = useState(false);

  const [formData, setFormData] = useState({
    fullName: initialData?.fullName || "",
    city: initialData?.city || "",
    province: initialData?.province || "",
    postalCode: initialData?.postalCode || "",
    phone: initialData?.phone || "",
    landmark: initialData?.landmark || "",
    locality: initialData?.locality || "",
    coordinates: initialData?.coordinates || { lat: 27.7172, lng: 85.324 },
    isDefault: initialData?.isDefault || false,
  });

  useEffect(() => {
    if (selectedProvince)
      setDistricts(districtsByProvince[selectedProvince] || []);
    else setDistricts([]);
  }, [selectedProvince]);

  useEffect(() => {
    if (selectedDistrict)
      setLocalities(localitiesByDistrict[selectedDistrict] || []);
    else setLocalities([]);
  }, [selectedDistrict]);

  const handleProvinceChange = (value: string) => {
    setSelectedProvince(value);
    setFormData((prev) => ({
      ...prev,
      province: nepalProvinces.find((p) => p.id === value)?.name || "",
    }));
    setSelectedDistrict("");
    setSelectedLocality("");
  };

  const handleDistrictChange = (value: string) => {
    setSelectedDistrict(value);
    setFormData((prev) => ({ ...prev, city: value }));
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
      return toast({
        title: "Invalid Phone Number",
        description: "Enter valid Nepali number",
        variant: "destructive",
      });
    }

    if (formData.postalCode && !/^\d{5}$/.test(formData.postalCode)) {
      return toast({
        title: "Invalid Postal Code",
        description: "Postal code must be 5 digits",
        variant: "destructive",
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
        return toast({
          title: "Error",
          description: result.error || "Failed to save address",
          variant: "destructive",
        });
      }

      toast({
        title: "Success",
        description: initialData ? "Address updated" : "Address added",
      });
      router.push(`/${domain}/dashboard/addresses`);
      router.refresh();
    } catch (error: any) {
      console.error(error);
      toast({
        title: "Error",
        description: error.message || "Something went wrong",
        variant: "destructive",
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
            <div className="space-y-2">
              <Label htmlFor="province">Province</Label>
              <Select
                value={selectedProvince}
                onValueChange={handleProvinceChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select province" />
                </SelectTrigger>
                <SelectContent>
                  {nepalProvinces.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">District</Label>
              <Select
                value={selectedDistrict}
                onValueChange={handleDistrictChange}
                disabled={!selectedProvince}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select district" />
                </SelectTrigger>
                <SelectContent>
                  {districts.map((d) => (
                    <SelectItem key={d} value={d}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="locality">Locality</Label>
              <Select
                value={selectedLocality}
                onValueChange={handleLocalityChange}
                disabled={!selectedDistrict}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select locality" />
                </SelectTrigger>
                <SelectContent>
                  {localities.map((l) => (
                    <SelectItem key={l} value={l}>
                      {l}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
