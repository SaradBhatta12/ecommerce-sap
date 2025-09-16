"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller, Resolver } from "react-hook-form";
import { z } from "zod";
import {
  X,
  ImageIcon,
  Package,
  Settings,
  Save,
  Upload,
  DollarSign,
  Tag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTheme } from "next-themes";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { VariantManager } from "./varient-manager";
import { useCreateProductMutation, useUpdateProductMutation } from "@/store";
import QuilEditor from "./QuilEditor";

// Enhanced schemas
const variantImageSchema = z.object({
  caption: z.string().optional(),
  document: z.string().optional(),
});

const variantTypeSchema = z.object({
  inventory_type: z.string().min(1, "Type is required"),
  value: z.string().min(1, "Value is required"),
});

const variantSchema = z.object({
  id: z.string().optional(),
  barcode: z.string().optional(),
  sku_of_match: z.string().optional(),
  sku_from_system: z.string().optional(),
  variant_type: z
    .array(variantTypeSchema)
    .min(1, "At least one variant type required"),
  is_available: z.boolean().default(true),
  inventory: z.coerce.number().int().nonnegative().default(0),
  max_order: z.coerce.number().int().nonnegative().default(0),
  min_order: z.coerce.number().int().nonnegative().default(1),
  min_stock_warning: z.coerce.number().int().nonnegative().default(5),
  price: z.coerce.number().nonnegative().default(0),
  sales_price: z.coerce.number().nonnegative().default(0),
  actual_price: z.coerce.number().nonnegative().default(0),
  actual_sales_price: z.coerce.number().nonnegative().default(0),
  is_active: z.boolean().default(true),
  image: z.array(variantImageSchema).default([]),
});

const productSchema = z.object({
  name: z.string().min(3, "Product name must be at least 3 characters"),
  description: z
    .string()
    .min(20, "Description must be at least 20 characters")
    .max(5000, "Description must not exceed 5000 characters")
    .refine(
      (val) => {
        // Remove HTML tags and check word count
        const textOnly = val.replace(/<[^>]*>/g, '').trim();
        const wordCount = textOnly.split(/\s+/).filter(word => word.length > 0).length;
        return wordCount >= 10;
      },
      "Description must contain at least 10 words"
    ),
  price: z.coerce.number().positive("Price must be positive"),
  discountPrice: z.coerce.number().nonnegative().optional(),
  stock: z.coerce.number().int().nonnegative().default(0),
  images: z.array(z.string()).default([]),
  category: z.string().min(1, "Category is required"),
  brand: z.string().optional(),
  tags: z.array(z.string()).default([]),
  variant: z.array(variantSchema).default([]),
  sku: z.string().min(1, "SKU is required"),
  barcode: z.string().optional(),
  weight: z.coerce.number().nonnegative().optional(),
  dimensions: z
    .object({
      length: z.coerce.number().nonnegative().default(0),
      width: z.coerce.number().nonnegative().default(0),
      height: z.coerce.number().nonnegative().default(0),
    })
    .optional(),
  status: z.enum(["draft", "published", "archived"]).default("draft"),
  visibility: z
    .enum(["public", "private", "password-protected"])
    .default("public"),
  isNew: z.boolean().default(false),
  isFeatured: z.boolean().default(false),
  isOnSale: z.boolean().default(false),
  sustainabilityScore: z.coerce.number().min(0).max(100).optional(),
  carbonFootprint: z.coerce.number().nonnegative().optional(),
  recycledMaterials: z.boolean().default(false),
});

type ProductFormValues = z.infer<typeof productSchema>;

interface Category {
  _id: string;
  name: string;
}

interface Brand {
  _id: string;
  name: string;
}

interface ProductFormProps {
  initialData?: any;
  categories: Category[];
  brands: Brand[];
}

// SKU Generation Utility
const generateSKU = (productName: string, stock: number): string => {
  const productCode = productName
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase())
    .join("")
    .slice(0, 3);
  const timestamp = Date.now().toString().slice(-4);
  return `${productCode}${stock}${timestamp}`;
};

export function EnhancedProductForm({
  initialData,
  categories,
  brands,
}: ProductFormProps) {
  const theme = useTheme();
  const router = useRouter();
  const [images, setImages] = useState<string[]>(initialData?.images || []);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [newTag, setNewTag] = useState("");
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState("basic"); // Add state for tracking active tab

  // RTK Query mutations
  const [createProduct, { isLoading: isCreating }] = useCreateProductMutation();
  const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation();
  
  const loading = isCreating || isUpdating;

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema) as Resolver<ProductFormValues>,
    defaultValues: initialData || {
      name: "",
      description: "",
      price: 0,
      stock: 0,
      images: [],
      category: "",
      brand: "",
      tags: [],
      variant: [],
      sku: "",
      status: "draft",
      visibility: "public",
      isNew: false,
      isFeatured: false,
      isOnSale: false,
      recycledMaterials: false,
    },
  });

  // Check if variants exist and are properly configured
  const variants = form.watch("variant") || [];
  const hasVariants = variants.length > 0;
  
  // Check if create button should be disabled
  const shouldDisableCreateButton = hasVariants && activeTab !== "advanced" && !initialData;

  // Set mounted state after component mounts and theme is available
  useEffect(() => {
    setMounted(true);
  }, []);

  // Reset form when initialData changes (for edit mode)
  useEffect(() => {
    if (initialData) {
      // Transform the data to match form expectations
      const transformedData = {
        ...initialData,
        category: initialData.category?._id || initialData.category || "",
        brand: initialData.brand?._id || initialData.brand || "",
        price: Number(initialData.price) || 0,
        discountPrice: Number(initialData.discountPrice) || undefined,
        stock: Number(initialData.stock) || 0,
        images: initialData.images || [],
        tags: initialData.tags || [],
        variant: initialData.variant || [],
      };
      
      form.reset(transformedData);
      setImages(initialData.images || []);
    }
  }, [initialData, form]);

  // Auto-generate SKU when product name or stock changes
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === "name" || name === "stock") {
        const productName = value.name || "";
        const stock = value.stock || 0;

        if (productName) {
          const generatedSKU = generateSKU(productName, stock);
          form.setValue("sku", generatedSKU);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [form]);

  // Handle form submission
  const onSubmit = async (data: any) => {
    try {
      // Validate variants
      if (!data.variant || data.variant.length === 0) {
        toast.error("Please add at least one variant");
        return;
      }

      const productData = {
        ...data,
        images,
      };

      const isUpdate = Boolean(initialData);

      if (isUpdate) {
        await updateProduct({
          id: initialData._id,
          data: productData,
        }).unwrap();
        
        toast.success("Product updated successfully");
      } else {
        await createProduct(productData).unwrap();
        
        toast.success("Product created successfully");
      }

      router.push("/admin/products");
      router.refresh();
    } catch (error: any) {
      console.error("Form submission error:", error);
      
      // Handle RTK Query errors
      const errorMessage = error?.data?.message || 
                          error?.message || 
                          "An unexpected error occurred";
      
      toast.error(`Failed to ${initialData ? 'update' : 'create'} product: ${errorMessage}`);
    }
  };

  // Handle image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      setUploadingImage(true);
      const formData = new FormData();
      formData.append("file", files[0]);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Failed to upload image");

      const data = await response.json();
      setImages([...images, data.url]);
      form.setValue("images", [...images, data.url]);
      toast.success("Image uploaded successfully");
    } catch (error: any) {
      console.error("Image upload error:", error);
      toast.error("Failed to upload image");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleRemoveImage = (index: number) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);
    form.setValue("images", newImages);
  };

  // Tag management
  const handleAddTag = () => {
    if (newTag.trim() === "") return;
    const currentTags = form.getValues("tags") || [];
    if (!currentTags.includes(newTag.trim())) {
      form.setValue("tags", [...currentTags, newTag.trim()]);
      setNewTag("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    const currentTags = form.getValues("tags") || [];
    form.setValue(
      "tags",
      currentTags.filter((t) => t !== tag)
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950 p-6">
      <div className="mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg">
              <Package className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
              {initialData ? "Edit Product" : "Create Product"}
            </h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Create products with multiple variants and automatic SKU generation
          </p>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="variants">Variants</TabsTrigger>
              <TabsTrigger value="media">Media</TabsTrigger>
              <TabsTrigger value="advanced">Advanced</TabsTrigger>
            </TabsList>

            {/* Basic Information Tab */}
            <TabsContent value="basic" className="space-y-6">
              <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-6">
                  <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-0">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Package className="h-5 w-5 text-blue-600" />
                        Product Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="name">Product Name *</Label>
                          <Input
                            id="name"
                            placeholder="Enter product name"
                            {...form.register("name")}
                          />
                          {form.formState.errors.name && (
                            <p className="text-sm text-red-500">
                              {form.formState.errors.name.message}
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="sku">SKU (Auto-generated) *</Label>
                          <Input
                            id="sku"
                            placeholder="Will be auto-generated"
                            {...form.register("sku")}
                            readOnly
                            className="bg-gray-50 dark:bg-gray-800"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="description">Description *</Label>
                        <div className="relative">
                          {mounted ? (
                            <QuilEditor
                              value={form.watch("description") || ""}
                              onChange={(value) => {
                                form.setValue("description", value, { shouldValidate: true });
                              }}
                              theme={theme.theme}
                              placeholder="Write a detailed product description. Include features, benefits, specifications, and any other relevant information that will help customers understand your product."
                              className={form.formState.errors.description ? "border-red-500" : ""}
                            />
                          ) : (
                            <div className="min-h-[200px] border rounded-md bg-muted/50 animate-pulse flex items-center justify-center">
                              <div className="text-sm text-muted-foreground">Loading description editor...</div>
                            </div>
                          )}
                        </div>
                        {form.formState.errors.description && (
                          <p className="text-sm text-red-500 flex items-center gap-1">
                            <span className="text-xs">⚠</span>
                            {form.formState.errors.description.message}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          Tip: A good description should be at least 50 words and include key product features, benefits, and specifications.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                        <div className="space-y-2">
                          <Label htmlFor="price">Base Price *</Label>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                            <Input
                              id="price"
                              type="number"
                              step="0.01"
                              placeholder="0.00"
                              className="pl-10"
                              {...form.register("price")}
                            />
                          </div>
                          {form.formState.errors.price && (
                            <p className="text-sm text-red-500">
                              {form.formState.errors.price.message}
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="stock">Base Stock</Label>
                          <Input
                            id="stock"
                            type="number"
                            placeholder="0"
                            {...form.register("stock")}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="barcode">Barcode</Label>
                          <Input
                            id="barcode"
                            placeholder="123456789"
                            {...form.register("barcode")}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Tags */}
                  <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-0">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Tag className="h-5 w-5 text-green-600" />
                        Tags
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex flex-wrap gap-2 mb-3">
                        {form.watch("tags")?.map((tag) => (
                          <Badge key={tag} variant="outline" className="gap-1">
                            {tag}
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-4 w-4 p-0"
                              onClick={() => handleRemoveTag(tag)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </Badge>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Add a tag"
                          value={newTag}
                          onChange={(e) => setNewTag(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleAddTag();
                            }
                          }}
                        />
                        <Button type="button" onClick={handleAddTag}>
                          Add
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-6">
                  <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-0">
                    <CardHeader>
                      <CardTitle>Organization</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="category">Category *</Label>
                        <Controller
                          name="category"
                          control={form.control}
                          render={({ field }) => (
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                              <SelectContent>
                                {categories.map((category) => (
                                  <SelectItem
                                    key={category._id}
                                    value={category._id}
                                  >
                                    {category.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        />
                        {form.formState.errors.category && (
                          <p className="text-sm text-red-500">
                            {form.formState.errors.category.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="brand">Brand</Label>
                        <Controller
                          name="brand"
                          control={form.control}
                          render={({ field }) => (
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select brand" />
                              </SelectTrigger>
                              <SelectContent>
                                {brands.map((brand) => (
                                  <SelectItem key={brand._id} value={brand._id}>
                                    {brand.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Status</Label>
                        <Controller
                          name="status"
                          control={form.control}
                          render={({ field }) => (
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="draft">Draft</SelectItem>
                                <SelectItem value="published">
                                  Published
                                </SelectItem>
                                <SelectItem value="archived">
                                  Archived
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Product Flags */}
                  <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-0">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Settings className="h-5 w-5 text-emerald-600" />
                        Product Flags
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-white/50 dark:bg-slate-700/50 rounded-lg">
                        <div className="space-y-1">
                          <Label className="cursor-pointer font-medium">
                            New Product
                          </Label>
                          <p className="text-xs text-muted-foreground">
                            Mark as new arrival
                          </p>
                        </div>
                        <Controller
                          name="isNew"
                          control={form.control}
                          render={({ field }) => (
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          )}
                        />
                      </div>

                      <div className="flex items-center justify-between p-3 bg-white/50 dark:bg-slate-700/50 rounded-lg">
                        <div className="space-y-1">
                          <Label className="cursor-pointer font-medium">
                            Featured
                          </Label>
                          <p className="text-xs text-muted-foreground">
                            Show in featured section
                          </p>
                        </div>
                        <Controller
                          name="isFeatured"
                          control={form.control}
                          render={({ field }) => (
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          )}
                        />
                      </div>

                      <div className="flex items-center justify-between p-3 bg-white/50 dark:bg-slate-700/50 rounded-lg">
                        <div className="space-y-1">
                          <Label className="cursor-pointer font-medium">
                            On Sale
                          </Label>
                          <p className="text-xs text-muted-foreground">
                            Product is on sale
                          </p>
                        </div>
                        <Controller
                          name="isOnSale"
                          control={form.control}
                          render={({ field }) => (
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          )}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* Variants Tab */}
            <TabsContent value="variants" className="space-y-6">
              <VariantManager
                productName={form.watch("name") || ""}
                basePrice={form.watch("price") || 0}
                baseStock={form.watch("stock") || 0}
                variants={form.watch("variant") || []}
                onVariantsChange={(variants) =>
                  form.setValue("variant", variants)
                }
              />
            </TabsContent>

            {/* Media Tab */}
            <TabsContent value="media" className="space-y-6">
              <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ImageIcon className="h-5 w-5 text-green-600" />
                    Product Images
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                    {images.map((image, index) => (
                      <div
                        key={index}
                        className="group relative aspect-square rounded-lg border-2 border-dashed border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 overflow-hidden hover:border-blue-400 transition-colors"
                      >
                        <img
                          src={image || "/placeholder.svg"}
                          alt={`Product image ${index + 1}`}
                          className="h-full w-full object-cover"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute right-2 top-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleRemoveImage(index)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                    <div className="flex aspect-square items-center justify-center rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-slate-700 transition-colors">
                      <label
                        htmlFor="image-upload"
                        className="flex h-full w-full cursor-pointer flex-col items-center justify-center gap-2 p-4 text-center"
                      >
                        <Upload className="h-8 w-8 text-slate-400" />
                        <span className="text-sm text-slate-500 dark:text-slate-400">
                          Upload Image
                        </span>
                        <Input
                          id="image-upload"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleImageUpload}
                          disabled={uploadingImage}
                        />
                      </label>
                    </div>
                  </div>
                  {uploadingImage && (
                    <div className="flex items-center gap-2 text-sm text-blue-600 mt-4">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent" />
                      Uploading image...
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Advanced Tab */}
            <TabsContent value="advanced" className="space-y-6">
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-0">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="h-5 w-5 text-blue-600" />
                      Product Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="weight">Weight (kg)</Label>
                      <Input
                        id="weight"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        {...form.register("weight")}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Dimensions (cm)</Label>
                      <div className="grid grid-cols-3 gap-2">
                        <Input
                          type="number"
                          step="0.1"
                          placeholder="Length"
                          {...form.register("dimensions.length")}
                        />
                        <Input
                          type="number"
                          step="0.1"
                          placeholder="Width"
                          {...form.register("dimensions.width")}
                        />
                        <Input
                          type="number"
                          step="0.1"
                          placeholder="Height"
                          {...form.register("dimensions.height")}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="discountPrice">Discount Price</Label>
                      <Input
                        id="discountPrice"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        {...form.register("discountPrice")}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-0">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Package className="h-5 w-5 text-green-600" />
                      Sustainability
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="sustainabilityScore">
                        Sustainability Score (0-100)
                      </Label>
                      <Input
                        id="sustainabilityScore"
                        type="number"
                        min="0"
                        max="100"
                        {...form.register("sustainabilityScore")}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="carbonFootprint">
                        Carbon Footprint (kg CO2)
                      </Label>
                      <Input
                        id="carbonFootprint"
                        type="number"
                        step="0.01"
                        {...form.register("carbonFootprint")}
                      />
                    </div>

                    <div className="flex items-center justify-between p-3 bg-white/50 dark:bg-slate-700/50 rounded-lg">
                      <div className="space-y-1">
                        <Label className="cursor-pointer font-medium">
                          Made from Recycled Materials
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          Product contains recycled materials
                        </p>
                      </div>
                      <Controller
                        name="recycledMaterials"
                        control={form.control}
                        render={({ field }) => (
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>

          {/* Action Buttons */}
          <div className="flex gap-4 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || shouldDisableCreateButton}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  Saving...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  {initialData ? "Update Product" : "Create Product"}
                </div>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
