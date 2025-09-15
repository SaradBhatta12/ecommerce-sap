"use client";

import type React from "react";
import { useState, useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { X, Upload } from "lucide-react";
import { createCategory, updateCategory } from "@/_actions/_category";

interface CategoryFormProps {
  category?: any;
  categories?: any[];
}

export default function CategoryForm({
  category,
  categories = [],
}: CategoryFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();

  const [formData, setFormData] = useState({
    name: category?.name || "",
    description: category?.description || "",
    parent: category?.parent?._id || category?.parent || "none",
  });

  const [image, setImage] = useState<string>(category?.image || "");

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];
    const form = new FormData();
    form.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: form,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to upload image");

      setImage(data.url);
      fileInputRef.current && (fileInputRef.current.value = "");
    } catch (err) {
      console.error(err);
      toast.error("Image upload failed");
    }
  };

  const removeImage = () => setImage("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const categoryData = {
      ...formData,
      parent: formData.parent === "none" ? null : formData.parent,
      image,
    };

    startTransition(async () => {
      const res = category
        ? await updateCategory(category._id, categoryData)
        : await createCategory(categoryData);

      if (res.success) {
        toast.success(category ? "Category updated" : "Category created");
        router.push("/admin/categories");
      } else {
        toast.error(res.error || "Something went wrong");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Category Name</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="parent">Parent Category (Optional)</Label>
            <Select
              value={formData.parent}
              onValueChange={(value) => handleSelectChange("parent", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select parent category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None (Top Level)</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat._id} value={cat._id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={5}
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Category Image (Optional)</Label>
            <div className="flex items-center space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="mr-2 h-4 w-4" />
                Upload Image
              </Button>
              <Input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />
            </div>
            <p className="text-sm text-muted-foreground">
              Recommended size: 200x200 pixels
            </p>
          </div>

          {image && (
            <Card className="overflow-hidden">
              <div className="relative aspect-square max-w-[200px]">
                <Image
                  src={image}
                  alt="Category image"
                  fill
                  className="object-cover"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute right-2 top-2 h-6 w-6"
                  onClick={removeImage}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/admin/categories")}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending
            ? category
              ? "Updating..."
              : "Creating..."
            : category
            ? "Update Category"
            : "Create Category"}
        </Button>
      </div>
    </form>
  );
}
