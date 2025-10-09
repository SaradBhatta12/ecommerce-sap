"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, Navigation, Phone, MapPin, Home, Building, User } from "lucide-react";
import LocationPicker from "./location-picker";
import ImprovedAddressPicker from "./improved-address-picker";

import {
  useGetLocationTreeQuery,
  useGetLocationsByParentQuery,
} from "@/store/api/locationApi";

interface AddressFormProps {
  initialData?: {
    _id?: string;
    fullName: string;
    province: string;
    district: string;
    locality?: string;
    postalCode: string;
    phone: string;
    alternatePhone?: string;
    landmark?: string;
    addressType?: "home" | "office" | "other";
    coordinates?: {
      lat: number;
      lng: number;
    };
    isDefault?: boolean;
    deliveryInstructions?: string;
  };
}

export default function AddressForm({ initialData }: AddressFormProps) {
  const router = useRouter();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [showAddressPicker, setShowAddressPicker] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Enhanced form state with new fields
  const [formData, setFormData] = useState({
    fullName: initialData?.fullName || "",
    province: initialData?.province || "",
    district: initialData?.district || "",
    locality: initialData?.locality || "",
    postalCode: initialData?.postalCode || "",
    phone: initialData?.phone || "",
    alternatePhone: initialData?.alternatePhone || "",
    landmark: initialData?.landmark || "",
    addressType: initialData?.addressType || "home" as "home" | "office" | "other",
    coordinates: initialData?.coordinates || { lat: 0, lng: 0 },
    isDefault: initialData?.isDefault || false,
    deliveryInstructions: initialData?.deliveryInstructions || "",
  });

  // Fetch location hierarchy
  const { data: locationTree, isLoading: isLoadingTree } = useGetLocationTreeQuery();
  const { data: apiProvinces, isLoading: isLoadingProvinces } = useGetLocationsByParentQuery(null);
  const { data: apiDistricts, isLoading: isLoadingDistricts } = useGetLocationsByParentQuery(formData.province || null, {
    skip: !formData.province,
  });
  const { data: apiLocalities, isLoading: isLoadingLocalities } = useGetLocationsByParentQuery(formData.district || null, {
    skip: !formData.district,
  });

  // Validation functions
  const validatePhone = (phone: string) => {
    const phoneRegex = /^(9[678]\d{8})$/;
    return phoneRegex.test(phone);
  };

  const validatePostalCode = (postalCode: string) => {
    return !postalCode || /^\d{5}$/.test(postalCode);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = "Full name must be at least 2 characters";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!validatePhone(formData.phone)) {
      newErrors.phone = "Please enter a valid Nepali phone number (98xxxxxxxx)";
    }

    if (formData.alternatePhone && !validatePhone(formData.alternatePhone)) {
      newErrors.alternatePhone = "Please enter a valid alternate phone number (98xxxxxxxx)";
    }

    if (formData.postalCode && !validatePostalCode(formData.postalCode)) {
      newErrors.postalCode = "Postal code must be 5 digits";
    }

    if (!formData.province) {
      newErrors.province = "Province is required";
    }

    if (!formData.district) {
      newErrors.district = "District is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handlers
  const handleProvinceChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      province: value,
      district: "",
      locality: "",
    }));
    if (errors.province) {
      setErrors(prev => ({ ...prev, province: "" }));
    }
  };

  const handleDistrictChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      district: value,
      locality: "",
    }));
    if (errors.district) {
      setErrors(prev => ({ ...prev, district: "" }));
    }
  };

  const handleLocalityChange = (value: string) => {
    setFormData((prev) => ({ ...prev, locality: value }));
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleAddressTypeChange = (value: "home" | "office" | "other") => {
    setFormData((prev) => ({ ...prev, addressType: value }));
  };

  const handleCheckboxChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, isDefault: checked }));
  };

  const handleLocationSelect = (lat: number, lng: number) => {
    setFormData((prev) => ({ ...prev, coordinates: { lat, lng } }));
    setShowLocationPicker(false);
  };

  // Submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Prevent multiple submissions
    if (isSubmitting) {
      return;
    }

    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
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
        if (result.details && Array.isArray(result.details)) {
          // Handle validation errors from server
          result.details.forEach((detail: string) => {
            toast.error("Validation Error", { description: detail });
          });
        } else {
          toast.error("Error", {
            description: result.error || "Failed to save address",
          });
        }
        return;
      }

      toast.success("Success", {
        description: initialData ? "Address updated successfully" : "Address added successfully",
      });
      
      // Use replace instead of push to prevent back navigation issues
      router.replace(`/dashboard/addresses`);
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

  const getAddressTypeIcon = (type: string) => {
    switch (type) {
      case "home": return <Home className="h-4 w-4" />;
      case "office": return <Building className="h-4 w-4" />;
      default: return <MapPin className="h-4 w-4" />;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          {initialData ? "Edit Address" : "Add New Address"}
        </CardTitle>
        <CardDescription>
          {initialData
            ? "Update your delivery address information"
            : "Add a new delivery address to your account"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Full Name */}
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name *</Label>
              <Input
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                className={errors.fullName ? "border-red-500" : ""}
                placeholder="Enter your full name"
              />
              {errors.fullName && (
                <p className="text-sm text-red-500">{errors.fullName}</p>
              )}
            </div>

            {/* Address Type */}
            <div className="space-y-2">
              <Label>Address Type</Label>
              <Select value={formData.addressType} onValueChange={handleAddressTypeChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select address type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="home">
                    <div className="flex items-center gap-2">
                      <Home className="h-4 w-4" />
                      Home
                    </div>
                  </SelectItem>
                  <SelectItem value="office">
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4" />
                      Office
                    </div>
                  </SelectItem>
                  <SelectItem value="other">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Other
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone">Mobile Number *</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className={`pl-10 ${errors.phone ? "border-red-500" : ""}`}
                  placeholder="98xxxxxxxx"
                />
              </div>
              {errors.phone && (
                <p className="text-sm text-red-500">{errors.phone}</p>
              )}
            </div>

            {/* Alternate Phone */}
            <div className="space-y-2">
              <Label htmlFor="alternatePhone">Alternate Phone</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="alternatePhone"
                  name="alternatePhone"
                  value={formData.alternatePhone}
                  onChange={handleInputChange}
                  className={`pl-10 ${errors.alternatePhone ? "border-red-500" : ""}`}
                  placeholder="98xxxxxxxx (optional)"
                />
              </div>
              {errors.alternatePhone && (
                <p className="text-sm text-red-500">{errors.alternatePhone}</p>
              )}
            </div>

            {/* Location Picker */}
            <div className="space-y-4 md:col-span-2">
              <div className="space-y-2">
                <Label>Location *</Label>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddressPicker(true)}
                  className={`w-full justify-start h-auto p-4 ${errors.province || errors.district ? "border-red-500" : ""}`}
                >
                  <div className="flex items-start gap-3">
                    <Navigation className="h-5 w-5 mt-0.5 text-muted-foreground" />
                    <div className="text-left">
                      {formData.province || formData.district || formData.locality ? (
                        <div>
                          <div className="font-medium">
                            {[formData.locality, formData.district, formData.province]
                              .filter(Boolean)
                              .join(", ")}
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
                {(errors.province || errors.district) && (
                  <p className="text-sm text-red-500">
                    {errors.province || errors.district}
                  </p>
                )}
              </div>
            </div>

            {/* Postal Code */}
            <div className="space-y-2">
              <Label htmlFor="postalCode">Postal Code</Label>
              <Input
                id="postalCode"
                name="postalCode"
                value={formData.postalCode}
                onChange={handleInputChange}
                className={errors.postalCode ? "border-red-500" : ""}
                placeholder="e.g. 44600"
              />
              {errors.postalCode && (
                <p className="text-sm text-red-500">{errors.postalCode}</p>
              )}
            </div>

            {/* Map Picker */}
            <div className="space-y-2">
              <Label>Location on Map</Label>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowLocationPicker(true)}
              >
                <Navigation className="mr-2 h-4 w-4" />
                {formData.coordinates.lat !== 0
                  ? "Change Location"
                  : "Pick on Map"}
              </Button>
              {formData.coordinates.lat !== 0 && (
                <p className="text-xs text-muted-foreground">
                  {formData.coordinates.lat.toFixed(4)},{" "}
                  {formData.coordinates.lng.toFixed(4)}
                </p>
              )}
            </div>

            {/* Landmark */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="landmark">Landmark</Label>
              <Textarea
                id="landmark"
                name="landmark"
                value={formData.landmark}
                onChange={handleInputChange}
                placeholder="Near XYZ (optional)"
                className="resize-none"
                rows={2}
              />
            </div>

            {/* Delivery Instructions */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="deliveryInstructions">Delivery Instructions</Label>
              <Textarea
                id="deliveryInstructions"
                name="deliveryInstructions"
                value={formData.deliveryInstructions}
                onChange={handleInputChange}
                placeholder="Special instructions for delivery (optional)"
                className="resize-none"
                rows={3}
              />
            </div>

            {/* Default Checkbox */}
            <div className="flex items-center space-x-2 md:col-span-2">
              <Checkbox
                id="isDefault"
                checked={formData.isDefault}
                onCheckedChange={handleCheckboxChange}
              />
              <Label htmlFor="isDefault" className="flex items-center gap-2">
                {getAddressTypeIcon(formData.addressType)}
                Set as default address
              </Label>
            </div>
          </div>

          {/* Buttons */}
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
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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

        {/* Location Picker Modal */}
        {showLocationPicker && (
          <LocationPicker
            initialLocation={formData.coordinates}
            onSelect={handleLocationSelect}
            onCancel={() => setShowLocationPicker(false)}
          />
        )}

        {/* Address Picker Modal */}
        {showAddressPicker && (
          <ImprovedAddressPicker
            isOpen={showAddressPicker}
            onClose={() => setShowAddressPicker(false)}
            onSelect={(location) => {
              console.log("Selected location:", location);
              setFormData((prev) => ({
                ...prev,
                province: location.province?.name || "",
                district: location.city?.name || "",
                locality: location.landmark?.name || "",
                coordinates: location.coordinates || prev.coordinates,
              }));
              setShowAddressPicker(false);
              // Clear location errors when selection is made
              setErrors(prev => ({ ...prev, province: "", district: "" }));
            }}
            initialSelection={{
              province: formData.province ? { _id: "", name: formData.province, type: "province" } : undefined,
              city: formData.district ? { _id: "", name: formData.district, type: "city" } : undefined,
              landmark: formData.locality ? { _id: "", name: formData.locality, type: "landmark" } : undefined,
            }}
          />
        )}
      </CardContent>
    </Card>
  );
}