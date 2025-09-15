"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface VariantFormData {
  name: string;
  value: string;
  slug?: string;
  parentId?: string | null;
  isActive: boolean;
}

export default function NewVariantPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<VariantFormData>({
    name: "",
    value: "",
    slug: "",
    parentId: "",
    isActive: true,
  });

  const [variants, setVariants] = useState<{ _id: string; name: string }[]>([]);
  const [hexColor, setHexColor] = useState("#000000");

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      hexColor,
    }));
  }, [hexColor]);

  useEffect(() => {
    const fetchVariants = async () => {
      try {
        const res = await fetch("/api/variants");
        const data = await res.json();

        setVariants(data.variants || []);
      } catch (error) {
        console.error("Failed to fetch variants", error);
      }
    };
    fetchVariants();
  }, []);

  const handleInputChange = (field: keyof VariantFormData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const payload = {
      ...formData,
      slug:
        formData.slug?.trim() ||
        formData.name.toLowerCase().replace(/\s+/g, "-"),
    };

    try {
      const response = await fetch("/api/variants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Failed to create variant");

      toast.success("Variant created successfully");

      router.push("/admin/variants");
    } catch (error) {
      toast.error("Failed to create variant");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 p-4 pt-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/variants">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h2 className="text-xl font-bold tracking-tight">
            Create New Variant
          </h2>
          <p className="text-muted-foreground">
            Add a new product variant dynamically
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-bold tracking-tight">
              Variant Information
            </CardTitle>
            <CardDescription>
              Fill in the details for the new variant
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Name</Label>
              <Input
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
              />
            </div>

            <div>
              <Label>Value</Label>
              <Input
                value={formData.value}
                onChange={(e) => handleInputChange("value", e.target.value)}
              />
            </div>

            <div>
              <Label>Parent Variant (Optional)</Label>
              <select
                className="w-full border rounded p-2"
                value={formData.parentId || ""}
                onChange={(e) =>
                  handleInputChange("parentId", e.target.value || null)
                }
              >
                <option value="">None</option>
                {variants?.map((v) => (
                  <option key={v._id} value={v._id}>
                    {v.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label>Hex Color (Optional)</Label>
              <Input
                className="w-[200px] border rounded p-2"
                type="color"
                value={hexColor}
                onChange={(e) => setHexColor(e.target.value)}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                checked={formData.isActive}
                onCheckedChange={(checked) =>
                  handleInputChange("isActive", checked)
                }
              />
              <Label>Active</Label>
            </div>

            <Button type="submit" disabled={isLoading}>
              <Save className="mr-2 h-4 w-4" />
              {isLoading ? "Saving..." : "Save Variant"}
            </Button>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
