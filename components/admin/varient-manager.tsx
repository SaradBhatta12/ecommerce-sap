"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Plus,
  Trash2,
  Copy,
  Package,
  Upload,
  X,
  Edit3,
  ImageIcon,
} from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface VariantType {
  inventory_type: string;
  value: string;
}

interface VariantImage {
  caption?: string;
  document?: string;
}

interface Variant {
  id?: string;
  barcode?: string;
  sku_of_match?: string;
  sku_from_system?: string;
  variant_type: VariantType[];
  is_available: boolean;
  inventory: number;
  max_order: number;
  min_order: number;
  min_stock_warning: number;
  price: number;
  sales_price: number;
  actual_price: number;
  actual_sales_price: number;
  is_active: boolean;
  image: VariantImage[];
}

interface VariantManagerProps {
  productName: string;
  basePrice: number;
  baseStock: number;
  variants: Variant[];
  onVariantsChange: (variants: Variant[]) => void;
}

export function VariantManager({
  productName,
  basePrice,
  baseStock,
  variants,
  onVariantsChange,
}: VariantManagerProps) {
  const [variantTypes, setVariantTypes] = useState<
    { name: string; values: string[] }[]
  >([
    { name: "Color", values: [] },
    { name: "Size", values: [] },
  ]);
  const [newVariantType, setNewVariantType] = useState("");
  const [newVariantValue, setNewVariantValue] = useState("");
  const [selectedTypeIndex, setSelectedTypeIndex] = useState(0);
  const [editingVariant, setEditingVariant] = useState<{
    index: number;
    variant: Variant;
  } | null>(null);
  const [showVariantDialog, setShowVariantDialog] = useState(false);

  // Generate SKU for variant
  const generateVariantSKU = (variant: Variant, index: number): string => {
    const productCode = productName
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase())
      .join("")
      .slice(0, 3);

    const variantCode = variant.variant_type
      .map((vt) => vt.value.slice(0, 2).toUpperCase())
      .join("");
    const timestamp = Date.now().toString().slice(-4);

    return `${productCode}${variantCode}${timestamp}${index + 1}`;
  };

  // Generate all possible variant combinations
  const generateVariantCombinations = (): Variant[] => {
    const activeTypes = variantTypes.filter((type) => type.values.length > 0);

    if (activeTypes.length === 0) return [];

    const combinations: VariantType[][] = [[]];

    for (const type of activeTypes) {
      const newCombinations: VariantType[][] = [];
      for (const combination of combinations) {
        for (const value of type.values) {
          newCombinations.push([
            ...combination,
            { inventory_type: type.name, value },
          ]);
        }
      }
      combinations.splice(0, combinations.length, ...newCombinations);
    }

    return combinations.map((combo, index) => ({
      id: `variant-${Date.now()}-${index}`,
      variant_type: combo,
      is_available: true,
      inventory: 0,
      max_order: 0,
      min_order: 1,
      min_stock_warning: 5,
      price: basePrice,
      sales_price: basePrice,
      actual_price: basePrice,
      actual_sales_price: basePrice,
      is_active: true,
      image: [],
      sku_from_system: generateVariantSKU(
        { variant_type: combo } as Variant,
        index
      ),
    }));
  };

  // Add new variant type
  const addVariantType = () => {
    if (!newVariantType.trim()) return;

    if (
      variantTypes.some(
        (type) => type.name.toLowerCase() === newVariantType.toLowerCase()
      )
    ) {
      toast.error("Variant type already exists");
      return;
    }

    setVariantTypes([
      ...variantTypes,
      { name: newVariantType.trim(), values: [] },
    ]);
    setNewVariantType("");
    toast.success("Variant type added");
  };

  // Add value to variant type
  const addVariantValue = () => {
    if (!newVariantValue.trim() || selectedTypeIndex < 0) return;

    const updatedTypes = [...variantTypes];
    const currentValues = updatedTypes[selectedTypeIndex].values;

    if (currentValues.includes(newVariantValue.trim())) {
      toast.error("Value already exists");
      return;
    }

    updatedTypes[selectedTypeIndex].values.push(newVariantValue.trim());
    setVariantTypes(updatedTypes);
    setNewVariantValue("");
    toast.success("Value added");
  };

  // Remove variant type
  const removeVariantType = (index: number) => {
    const updatedTypes = [...variantTypes];
    updatedTypes.splice(index, 1);
    setVariantTypes(updatedTypes);
    toast.success("Variant type removed");
  };

  // Remove variant value
  const removeVariantValue = (typeIndex: number, valueIndex: number) => {
    const updatedTypes = [...variantTypes];
    updatedTypes[typeIndex].values.splice(valueIndex, 1);
    setVariantTypes(updatedTypes);
    toast.success("Value removed");
  };

  // Generate variants
  const handleGenerateVariants = () => {
    const newVariants = generateVariantCombinations();
    if (newVariants.length === 0) {
      toast.error("Please add variant types and values first");
      return;
    }

    onVariantsChange(newVariants);
    toast.success(`Generated ${newVariants.length} variants`);
  };

  // Add single variant manually
  const addSingleVariant = () => {
    const newVariant: Variant = {
      id: `variant-${Date.now()}`,
      variant_type: [{ inventory_type: "Custom", value: "Default" }],
      is_available: true,
      inventory: 0,
      max_order: 0,
      min_order: 1,
      min_stock_warning: 5,
      price: basePrice,
      sales_price: basePrice,
      actual_price: basePrice,
      actual_sales_price: basePrice,
      is_active: true,
      image: [],
      sku_from_system: generateVariantSKU(
        {
          variant_type: [{ inventory_type: "Custom", value: "Default" }],
        } as Variant,
        variants.length
      ),
    };

    onVariantsChange([...variants, newVariant]);
    toast.success("Variant added");
  };

  // Update variant
  const updateVariant = (index: number, field: keyof Variant, value: any) => {
    const updatedVariants = [...variants];
    updatedVariants[index] = { ...updatedVariants[index], [field]: value };
    onVariantsChange(updatedVariants);
  };

  // Edit variant
  const editVariant = (index: number) => {
    setEditingVariant({ index, variant: variants[index] });
    setShowVariantDialog(true);
  };

  // Save edited variant
  const saveEditedVariant = (updatedVariant: Variant) => {
    if (editingVariant) {
      const updatedVariants = [...variants];
      updatedVariants[editingVariant.index] = updatedVariant;
      onVariantsChange(updatedVariants);
      setEditingVariant(null);
      setShowVariantDialog(false);
      toast.success("Variant updated");
    }
  };

  // Duplicate variant
  const duplicateVariant = (index: number) => {
    const variantToDuplicate = variants[index];
    const duplicatedVariant = {
      ...variantToDuplicate,
      id: `variant-${Date.now()}-duplicate`,
      sku_from_system: generateVariantSKU(variantToDuplicate, variants.length),
    };
    onVariantsChange([...variants, duplicatedVariant]);
    toast.success("Variant duplicated");
  };

  // Remove variant
  const removeVariant = (index: number) => {
    const updatedVariants = [...variants];
    updatedVariants.splice(index, 1);
    onVariantsChange(updatedVariants);
    toast.success("Variant removed");
  };

  // Bulk update variants
  const bulkUpdatePrice = (newPrice: number) => {
    const updatedVariants = variants.map((variant) => ({
      ...variant,
      price: newPrice,
      sales_price: newPrice,
      actual_price: newPrice,
      actual_sales_price: newPrice,
    }));
    onVariantsChange(updatedVariants);
    toast.success("Prices updated for all variants");
  };

  const bulkUpdateStock = (newStock: number) => {
    const updatedVariants = variants.map((variant) => ({
      ...variant,
      inventory: newStock,
    }));
    onVariantsChange(updatedVariants);
    toast.success("Stock updated for all variants");
  };

  // Upload variant image
  const uploadVariantImage = async (variantIndex: number, file: File) => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Failed to upload image");

      const data = await response.json();
      const updatedVariants = [...variants];
      const newImage: VariantImage = {
        document: data.url,
        caption: `${variants[variantIndex].variant_type
          .map((vt) => vt.value)
          .join(" ")} image`,
      };

      updatedVariants[variantIndex].image = [
        ...(updatedVariants[variantIndex].image || []),
        newImage,
      ];
      onVariantsChange(updatedVariants);
      toast.success("Image uploaded successfully");
    } catch (error) {
      console.error("Image upload error:", error);
      toast.error("Failed to upload image");
    }
  };

  // Remove variant image
  const removeVariantImage = (variantIndex: number, imageIndex: number) => {
    const updatedVariants = [...variants];
    updatedVariants[variantIndex].image.splice(imageIndex, 1);
    onVariantsChange(updatedVariants);
    toast.success("Image removed");
  };

  return (
    <div className="space-y-6">
      {/* Variant Type Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Variant Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Add Variant Type */}
          <div className="flex gap-2">
            <Input
              placeholder="Enter variant type (e.g., Color, Size)"
              value={newVariantType}
              onChange={(e) => setNewVariantType(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addVariantType()}
            />
            <Button onClick={addVariantType}>
              <Plus className="h-4 w-4 mr-2" />
              Add Type
            </Button>
          </div>

          {/* Variant Types */}
          <div className="space-y-4">
            {variantTypes.map((type, typeIndex) => (
              <Card key={typeIndex} className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium">{type.name}</h4>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => removeVariantType(typeIndex)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>

                {/* Values */}
                <div className="flex flex-wrap gap-2 mb-3">
                  {type.values.map((value, valueIndex) => (
                    <Badge
                      key={valueIndex}
                      variant="secondary"
                      className="gap-1"
                    >
                      {value}
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-4 w-4 p-0"
                        onClick={() =>
                          removeVariantValue(typeIndex, valueIndex)
                        }
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>

                {/* Add Value */}
                <div className="flex gap-2">
                  <Input
                    placeholder={`Add ${type.name.toLowerCase()} value`}
                    value={
                      selectedTypeIndex === typeIndex ? newVariantValue : ""
                    }
                    onChange={(e) => {
                      setSelectedTypeIndex(typeIndex);
                      setNewVariantValue(e.target.value);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        setSelectedTypeIndex(typeIndex);
                        addVariantValue();
                      }
                    }}
                  />
                  <Button
                    size="sm"
                    onClick={() => {
                      setSelectedTypeIndex(typeIndex);
                      addVariantValue();
                    }}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          <div className="flex gap-4">
            <Button
              onClick={handleGenerateVariants}
              className="bg-gradient-to-r from-blue-600 to-purple-600"
            >
              <Package className="h-4 w-4 mr-2" />
              Generate Variants
            </Button>
            <Button onClick={addSingleVariant} variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Add Single Variant
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Generated Variants */}
      {variants.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Product Variants ({variants.length})</CardTitle>
              <div className="flex gap-2">
                <div className="flex items-center gap-2">
                  <Label className="text-sm">Bulk Price:</Label>
                  <Input
                    type="number"
                    step="0.01"
                    className="w-20"
                    placeholder="0.00"
                    onChange={(e) => {
                      const value = Number.parseFloat(e.target.value);
                      if (value > 0) bulkUpdatePrice(value);
                    }}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Label className="text-sm">Bulk Stock:</Label>
                  <Input
                    type="number"
                    className="w-20"
                    placeholder="0"
                    onChange={(e) => {
                      const value = Number.parseInt(e.target.value);
                      if (value >= 0) bulkUpdateStock(value);
                    }}
                  />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {variants.map((variant, index) => (
                <Card key={variant.id || index} className="p-4">
                  <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
                    {/* Variant Info */}
                    <div className="lg:col-span-3">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Variant</Label>
                        <div className="flex flex-wrap gap-1">
                          {variant.variant_type.map((vt, vtIndex) => (
                            <Badge
                              key={vtIndex}
                              variant="outline"
                              className="text-xs"
                            >
                              {vt.inventory_type}: {vt.value}
                            </Badge>
                          ))}
                        </div>
                        <div className="text-xs text-muted-foreground font-mono">
                          SKU: {variant.sku_from_system}
                        </div>
                      </div>
                    </div>

                    {/* Variant Images */}
                    <div className="lg:col-span-2">
                      <div className="space-y-2">
                        <Label className="text-sm">Images</Label>
                        <div className="flex flex-wrap gap-2">
                          {variant.image?.map((img, imgIndex) => (
                            <div key={imgIndex} className="relative group">
                              <img
                                src={img.document || "/placeholder.svg"}
                                alt={img.caption || "Variant image"}
                                className="w-12 h-12 object-cover rounded border"
                              />
                              <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                className="absolute -top-1 -right-1 h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() =>
                                  removeVariantImage(index, imgIndex)
                                }
                              >
                                <X className="h-2 w-2" />
                              </Button>
                            </div>
                          ))}
                          <label className="w-12 h-12 border-2 border-dashed border-gray-300 rounded flex items-center justify-center cursor-pointer hover:border-blue-400 transition-colors">
                            <Upload className="h-4 w-4 text-gray-400" />
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) uploadVariantImage(index, file);
                              }}
                            />
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Pricing */}
                    <div className="lg:col-span-2">
                      <div className="space-y-2">
                        <Label className="text-sm">Price</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={variant.price}
                          onChange={(e) =>
                            updateVariant(
                              index,
                              "price",
                              Number.parseFloat(e.target.value) || 0
                            )
                          }
                        />
                      </div>
                    </div>

                    <div className="lg:col-span-2">
                      <div className="space-y-2">
                        <Label className="text-sm">Sale Price</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={variant.sales_price}
                          onChange={(e) =>
                            updateVariant(
                              index,
                              "sales_price",
                              Number.parseFloat(e.target.value) || 0
                            )
                          }
                        />
                      </div>
                    </div>

                    {/* Inventory */}
                    <div className="lg:col-span-1">
                      <div className="space-y-2">
                        <Label className="text-sm">Stock</Label>
                        <Input
                          type="number"
                          value={variant.inventory}
                          onChange={(e) =>
                            updateVariant(
                              index,
                              "inventory",
                              Number.parseInt(e.target.value) || 0
                            )
                          }
                        />
                      </div>
                    </div>

                    {/* Status & Actions */}
                    <div className="lg:col-span-2">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label className="text-sm">Available</Label>
                          <Switch
                            checked={variant.is_available}
                            onCheckedChange={(checked) =>
                              updateVariant(index, "is_available", checked)
                            }
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label className="text-sm">Active</Label>
                          <Switch
                            checked={variant.is_active}
                            onCheckedChange={(checked) =>
                              updateVariant(index, "is_active", checked)
                            }
                          />
                        </div>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => editVariant(index)}
                          >
                            <Edit3 className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => duplicateVariant(index)}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => removeVariant(index)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator className="my-4" />

                  {/* Additional Fields */}
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                    <div className="space-y-2">
                      <Label className="text-sm">Barcode</Label>
                      <Input
                        value={variant.barcode || ""}
                        onChange={(e) =>
                          updateVariant(index, "barcode", e.target.value)
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm">Max Order</Label>
                      <Input
                        type="number"
                        value={variant.max_order}
                        onChange={(e) =>
                          updateVariant(
                            index,
                            "max_order",
                            Number.parseInt(e.target.value) || 0
                          )
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm">Min Order</Label>
                      <Input
                        type="number"
                        value={variant.min_order}
                        onChange={(e) =>
                          updateVariant(
                            index,
                            "min_order",
                            Number.parseInt(e.target.value) || 1
                          )
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm">Stock Warning</Label>
                      <Input
                        type="number"
                        value={variant.min_stock_warning}
                        onChange={(e) =>
                          updateVariant(
                            index,
                            "min_stock_warning",
                            Number.parseInt(e.target.value) || 5
                          )
                        }
                      />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary */}
      {variants.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Variant Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {variants.length}
                </div>
                <div className="text-sm text-muted-foreground">
                  Total Variants
                </div>
              </div>
              <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {variants.filter((v) => v.is_active).length}
                </div>
                <div className="text-sm text-muted-foreground">
                  Active Variants
                </div>
              </div>
              <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {variants.reduce((sum, v) => sum + v.inventory, 0)}
                </div>
                <div className="text-sm text-muted-foreground">Total Stock</div>
              </div>
              <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">
                  {variants.length > 0 && (
                    <>
                      ${Math.min(...variants.map((v) => v.price)).toFixed(2)} -
                      ${Math.max(...variants.map((v) => v.price)).toFixed(2)}
                    </>
                  )}
                </div>
                <div className="text-sm text-muted-foreground">Price Range</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Variant Edit Dialog */}
      <Dialog open={showVariantDialog} onOpenChange={setShowVariantDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Variant Details</DialogTitle>
          </DialogHeader>
          {editingVariant && (
            <VariantEditForm
              variant={editingVariant.variant}
              onSave={saveEditedVariant}
              onCancel={() => {
                setEditingVariant(null);
                setShowVariantDialog(false);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Enhanced Variant Edit Form Component
function VariantEditForm({
  variant,
  onSave,
  onCancel,
}: {
  variant: Variant;
  onSave: (variant: Variant) => void;
  onCancel: () => void;
}) {
  const [editedVariant, setEditedVariant] = useState(variant);
  const [uploadingImage, setUploadingImage] = useState(false);

  const handleSave = () => {
    onSave(editedVariant);
  };

  // Upload variant image
  const uploadVariantImage = async (file: File) => {
    try {
      setUploadingImage(true);
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Failed to upload image");

      const data = await response.json();
      const newImage: VariantImage = {
        document: data.url,
        caption:
          editedVariant.variant_type.map((vt) => vt.value).join(" ") + " image",
      };

      setEditedVariant({
        ...editedVariant,
        image: [...(editedVariant.image || []), newImage],
      });
      toast.success("Image uploaded successfully");
    } catch (error) {
      console.error("Image upload error:", error);
      toast.error("Failed to upload image");
    } finally {
      setUploadingImage(false);
    }
  };

  // Remove variant image
  const removeVariantImage = (imageIndex: number) => {
    const updatedImages = [...(editedVariant.image || [])];
    updatedImages.splice(imageIndex, 1);
    setEditedVariant({ ...editedVariant, image: updatedImages });
    toast.success("Image removed");
  };

  // Update image caption
  const updateImageCaption = (imageIndex: number, caption: string) => {
    const updatedImages = [...(editedVariant.image || [])];
    updatedImages[imageIndex] = { ...updatedImages[imageIndex], caption };
    setEditedVariant({ ...editedVariant, image: updatedImages });
  };

  return (
    <div className="space-y-6">
      {/* Variant Info */}
      <Card className="p-4 bg-blue-50 dark:bg-blue-900/20">
        <div className="flex flex-wrap gap-2">
          {editedVariant.variant_type.map((vt, index) => (
            <Badge key={index} variant="outline">
              {vt.inventory_type}: {vt.value}
            </Badge>
          ))}
        </div>
        <div className="text-sm text-muted-foreground mt-2 font-mono">
          SKU: {editedVariant.sku_from_system}
        </div>
      </Card>

      {/* Variant Images */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Variant Images
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {editedVariant.image?.map((img, index) => (
              <div key={index} className="space-y-2">
                <div className="group relative aspect-square rounded-lg border-2 border-dashed border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 overflow-hidden hover:border-blue-400 transition-colors">
                  <img
                    src={img.document || "/placeholder.svg"}
                    alt={img.caption || `Variant image ${index + 1}`}
                    className="h-full w-full object-cover"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute right-2 top-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removeVariantImage(index)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
                <Input
                  placeholder="Image caption"
                  value={img.caption || ""}
                  onChange={(e) => updateImageCaption(index, e.target.value)}
                  className="text-xs"
                />
              </div>
            ))}
            <div className="flex aspect-square items-center justify-center rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-slate-700 transition-colors">
              <label className="flex h-full w-full cursor-pointer flex-col items-center justify-center gap-2 p-4 text-center">
                <Upload className="h-8 w-8 text-slate-400" />
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  {uploadingImage ? "Uploading..." : "Upload Image"}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) uploadVariantImage(file);
                  }}
                  disabled={uploadingImage}
                />
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pricing */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Pricing</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Regular Price</Label>
            <Input
              type="number"
              step="0.01"
              value={editedVariant.price}
              onChange={(e) =>
                setEditedVariant({
                  ...editedVariant,
                  price: Number.parseFloat(e.target.value) || 0,
                })
              }
            />
          </div>
          <div className="space-y-2">
            <Label>Sale Price</Label>
            <Input
              type="number"
              step="0.01"
              value={editedVariant.sales_price}
              onChange={(e) =>
                setEditedVariant({
                  ...editedVariant,
                  sales_price: Number.parseFloat(e.target.value) || 0,
                })
              }
            />
          </div>
          <div className="space-y-2">
            <Label>Actual Price</Label>
            <Input
              type="number"
              step="0.01"
              value={editedVariant.actual_price}
              onChange={(e) =>
                setEditedVariant({
                  ...editedVariant,
                  actual_price: Number.parseFloat(e.target.value) || 0,
                })
              }
            />
          </div>
          <div className="space-y-2">
            <Label>Actual Sale Price</Label>
            <Input
              type="number"
              step="0.01"
              value={editedVariant.actual_sales_price}
              onChange={(e) =>
                setEditedVariant({
                  ...editedVariant,
                  actual_sales_price: Number.parseFloat(e.target.value) || 0,
                })
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Inventory */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Inventory Management</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Stock Quantity</Label>
            <Input
              type="number"
              value={editedVariant.inventory}
              onChange={(e) =>
                setEditedVariant({
                  ...editedVariant,
                  inventory: Number.parseInt(e.target.value) || 0,
                })
              }
            />
          </div>
          <div className="space-y-2">
            <Label>Min Stock Warning</Label>
            <Input
              type="number"
              value={editedVariant.min_stock_warning}
              onChange={(e) =>
                setEditedVariant({
                  ...editedVariant,
                  min_stock_warning: Number.parseInt(e.target.value) || 0,
                })
              }
            />
          </div>
          <div className="space-y-2">
            <Label>Min Order Quantity</Label>
            <Input
              type="number"
              value={editedVariant.min_order}
              onChange={(e) =>
                setEditedVariant({
                  ...editedVariant,
                  min_order: Number.parseInt(e.target.value) || 1,
                })
              }
            />
          </div>
          <div className="space-y-2">
            <Label>Max Order Quantity</Label>
            <Input
              type="number"
              value={editedVariant.max_order}
              onChange={(e) =>
                setEditedVariant({
                  ...editedVariant,
                  max_order: Number.parseInt(e.target.value) || 0,
                })
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* SKU & Barcode */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">SKU & Identification</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>System SKU</Label>
            <Input
              value={editedVariant.sku_from_system || ""}
              onChange={(e) =>
                setEditedVariant({
                  ...editedVariant,
                  sku_from_system: e.target.value,
                })
              }
              className="font-mono"
            />
          </div>
          <div className="space-y-2">
            <Label>Match SKU</Label>
            <Input
              value={editedVariant.sku_of_match || ""}
              onChange={(e) =>
                setEditedVariant({
                  ...editedVariant,
                  sku_of_match: e.target.value,
                })
              }
            />
          </div>
          <div className="space-y-2 col-span-2">
            <Label>Barcode</Label>
            <Input
              value={editedVariant.barcode || ""}
              onChange={(e) =>
                setEditedVariant({ ...editedVariant, barcode: e.target.value })
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Status */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Status & Availability</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="space-y-1">
              <Label className="font-medium">Available for Purchase</Label>
              <p className="text-xs text-muted-foreground">
                Customers can purchase this variant
              </p>
            </div>
            <Switch
              checked={editedVariant.is_available}
              onCheckedChange={(checked) =>
                setEditedVariant({ ...editedVariant, is_available: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="space-y-1">
              <Label className="font-medium">Active in System</Label>
              <p className="text-xs text-muted-foreground">
                Variant is active and visible
              </p>
            </div>
            <Switch
              checked={editedVariant.is_active}
              onCheckedChange={(checked) =>
                setEditedVariant({ ...editedVariant, is_active: checked })
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-4 justify-end pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          type="button"
          onClick={handleSave}
          className="bg-blue-600 hover:bg-blue-700"
        >
          Save Changes
        </Button>
      </div>
    </div>
  );
}
