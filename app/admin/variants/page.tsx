"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  MoreHorizontal,
  Package,
  Palette,
  Ruler,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Variant {
  _id: string;
  name: string;
  type: "color" | "size" | "material" | "style";
  value: string;
  hexColor?: string;
  productCount: number;
  isActive: boolean;
  createdAt: string;
  parent: any;
}

export default function VariantsPage() {
  const [variants, setVariants] = useState<Variant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteVariantId, setDeleteVariantId] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchVariants();
  }, []);

  const fetchVariants = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/variants");
      const data = await response.json();
      setVariants(data.variants || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch variants",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteVariant = async () => {
    if (!deleteVariantId) return;

    try {
      const response = await fetch(`/api/variants/${deleteVariantId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete variant");
      }

      toast({
        title: "Success",
        description: "Variant deleted successfully",
      });

      fetchVariants();
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to delete variant",
        variant: "destructive",
      });
    } finally {
      setDeleteVariantId(null);
      setIsDeleteDialogOpen(false);
    }
  };

  const confirmDelete = (variantId: string) => {
    setDeleteVariantId(variantId);
    setIsDeleteDialogOpen(true);
  };

  const filteredVariants = variants?.filter((variant) =>
    variant.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getVariantIcon = (type: string) => {
    switch (type) {
      case "color":
        return <Palette className="h-4 w-4" />;
      case "size":
        return <Ruler className="h-4 w-4" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  const getVariantTypeColor = (type: string) => {
    switch (type) {
      case "color":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
      case "size":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "material":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "style":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  const stats = {
    total: variants.length,
    active: variants.filter((v) => v.isActive).length,
    colors: variants.filter((v) => v.type === "color").length,
    sizes: variants.filter((v) => v.type === "size").length,
  };

  return (
    <div className="space-y-6 p-4 md:p-8 pt-6">
      <div className="flex flex-col justify-between space-y-4 md:flex-row md:items-center md:space-y-0">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Product Variants
          </h2>
          <p className="text-muted-foreground">
            Manage colors, sizes, materials, and other product variations
          </p>
        </div>
        <Button asChild size="lg">
          <Link href="/admin/variants/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Variant
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Variants
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <div className="h-2 w-2 rounded-full bg-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.active}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Colors</CardTitle>
            <Palette className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.colors}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sizes</CardTitle>
            <Ruler className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.sizes}</div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div className="flex flex-1 items-center space-x-2">
          <div className="relative flex-1 md:max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search variants..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Variant</TableHead>
              <TableHead>Parant</TableHead>
              <TableHead>Value</TableHead>
              <TableHead>Products</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Skeleton className="h-8 w-8" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-16" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-8" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-16" />
                  </TableCell>
                  <TableCell className="text-right">
                    <Skeleton className="h-8 w-8 ml-auto" />
                  </TableCell>
                </TableRow>
              ))
            ) : filteredVariants.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <Package className="h-8 w-8 text-muted-foreground" />
                    <p className="text-muted-foreground">No variants found.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredVariants.map((variant) => (
                <TableRow key={variant._id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted">
                        {getVariantIcon(variant.type)}
                      </div>
                      <div>
                        <div className="font-medium">{variant.name}</div>
                        <div className="text-xs text-muted-foreground">
                          ID: {variant._id.slice(-8)}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={variant?.parent ? variant.parent.name : "main"}
                    >
                      {variant.parent ? variant.parent.name : "Main"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {variant.type === "color" && variant.hexColor && (
                        <div
                          className="h-4 w-4 rounded-full border border-gray-300"
                          style={{ backgroundColor: variant.hexColor }}
                        />
                      )}
                      <span className="font-medium">{variant.value}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{variant.productCount || 0}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={variant.isActive ? "default" : "secondary"}>
                      {variant.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/variants/${variant._id}`}>
                            Edit
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link
                            href={`/admin/variants/${variant._id}/duplicate`}
                          >
                            Duplicate
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => confirmDelete(variant._id)}
                          className="text-red-600"
                        >
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

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
            <Button variant="destructive" onClick={handleDeleteVariant}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
