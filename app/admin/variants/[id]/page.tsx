"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  Trash2,
  Package,
  Palette,
  Ruler,
  Shirt,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import { useParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface VariantFormData {
  name: string;
  type: "color" | "size" | "material" | "style";
  value: string;
  hexColor?: string;
  description?: string;
  isActive: boolean;
  sortOrder: number;
}

export default function EditVariantPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [formData, setFormData] = useState<VariantFormData>({
    name: "",
    type: "color",
    value: "",
    hexColor: "#000000",
    description: "",
    isActive: true,
    sortOrder: 0,
  });

  useEffect(() => {
    fetchVariant();
  }, [params.id]);

  const fetchVariant = async () => {
    try {
      const response = await fetch(`/api/variants/${params.id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch variant");
      }
      const data = await response.json();
      setFormData(data.variant);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load variant data",
        variant: "destructive",
      });
      router.push("/admin/variants");
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(`/api/variants/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to update variant");
      }

      toast({
        title: "Success",
        description: "Variant updated successfully",
      });

      router.push("/admin/variants");
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to update variant",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/variants/${params.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete variant");
      }

      toast({
        title: "Success",
        description: "Variant deleted successfully",
      });

      router.push("/admin/variants");
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to delete variant",
        variant: "destructive",
      });
    } finally {
      setIsDeleteDialogOpen(false);
    }
  };

  const handleInputChange = (field: keyof VariantFormData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "color":
        return <Palette className="h-4 w-4" />;
      case "size":
        return <Ruler className="h-4 w-4" />;
      case "material":
        return <Package className="h-4 w-4" />;
      case "style":
        return <Shirt className="h-4 w-4" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  if (isLoadingData) {
    return (
      <div className="space-y-6 p-4 md:p-8 pt-6">
        <div className="flex items-center space-x-4">
          <Skeleton className="h-10 w-10" />
          <div>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64 mt-2" />
          </div>
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-48" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          </div>
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-16 w-full" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/variants">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Edit Variant</h2>
            <p className="text-muted-foreground">
              Update variant details and settings
            </p>
          </div>
        </div>
        <Button
          variant="destructive"
          onClick={() => setIsDeleteDialogOpen(true)}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>
                  Update the basic details for your variant
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Variant Name *</Label>
                    <Input
                      id="name"
                      placeholder="e.g., Ocean Blue, Large, Cotton Blend"
                      value={formData.name}
                      onChange={(e) =>
                        handleInputChange("name", e.target.value)
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="value">Display Value *</Label>
                    <Input
                      id="value"
                      placeholder="e.g., Blue, L, Cotton"
                      value={formData.value}
                      onChange={(e) =>
                        handleInputChange("value", e.target.value)
                      }
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Optional description for this variant..."
                    value={formData.description}
                    onChange={(e) =>
                      handleInputChange("description", e.target.value)
                    }
                    rows={3}
                  />
                </div>

                {formData.type === "color" && (
                  <div className="space-y-2 pt-4 border-t">
                    <Label htmlFor="hexColor">Color Code</Label>
                    <div className="flex items-center space-x-3">
                      <Input
                        id="hexColor"
                        type="color"
                        value={formData.hexColor}
                        onChange={(e) =>
                          handleInputChange("hexColor", e.target.value)
                        }
                        className="w-16 h-10 p-1 border rounded"
                      />
                      <Input
                        placeholder="#000000"
                        value={formData.hexColor}
                        onChange={(e) =>
                          handleInputChange("hexColor", e.target.value)
                        }
                        className="flex-1"
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Preview */}
            <Card>
              <CardHeader>
                <CardTitle>Preview</CardTitle>
                <CardDescription>How this variant appears</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-3 border rounded-lg">
                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted">
                      {getTypeIcon(formData.type)}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{formData.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {formData.value}
                      </div>
                    </div>
                  </div>

                  <Badge variant="secondary" className="capitalize">
                    {formData.type}
                  </Badge>

                  {formData.type === "color" && formData.hexColor && (
                    <div className="flex items-center space-x-2 p-2 border rounded">
                      <div
                        className="h-6 w-6 rounded-full border"
                        style={{ backgroundColor: formData.hexColor }}
                      />
                      <span className="text-sm">{formData.hexColor}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Settings</CardTitle>
                <CardDescription>Configure variant settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Active Status</Label>
                    <div className="text-sm text-muted-foreground">
                      Make this variant available for use
                    </div>
                  </div>
                  <Switch
                    checked={formData.isActive}
                    onCheckedChange={(checked) =>
                      handleInputChange("isActive", checked)
                    }
                  />
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label htmlFor="sortOrder">Sort Order</Label>
                  <Input
                    id="sortOrder"
                    type="number"
                    placeholder="0"
                    value={formData.sortOrder}
                    onChange={(e) =>
                      handleInputChange(
                        "sortOrder",
                        Number.parseInt(e.target.value) || 0
                      )
                    }
                  />
                  <div className="text-xs text-muted-foreground">
                    Lower numbers appear first
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    <Save className="mr-2 h-4 w-4" />
                    {isLoading ? "Saving..." : "Save Changes"}
                  </Button>
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/admin/variants">Cancel</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this variant? This action cannot
              be undone and may affect products using this variant.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
