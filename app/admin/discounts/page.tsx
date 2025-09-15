"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Calendar,
  Edit,
  Loader2,
  Plus,
  Search,
  Trash2,
  ToggleLeft,
  ToggleRight,
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
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Discount {
  _id: string;
  code: string;
  type: "percentage" | "fixed";
  value: number;
  minPurchase?: number;
  maxDiscount?: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  usageLimit?: number;
  usageCount: number;
  applicableProducts: string[];
  applicableCategories: string[];
}

export default function DiscountsPage() {
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isTogglingStatus, setIsTogglingStatus] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    fetchDiscounts();
  }, []);

  const fetchDiscounts = async () => {
    try {
      const response = await fetch("/api/admin/discounts");
      if (!response.ok) throw new Error("Failed to fetch discounts");

      const data = await response.json();
      setDiscounts(data);
    } catch (error) {
      console.error("Error fetching discounts:", error);
      toast({
        title: "Error",
        description: "Failed to load discounts. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      setIsTogglingStatus(id);

      const response = await fetch(`/api/admin/discounts/${id}/toggle-status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      if (!response.ok) throw new Error("Failed to update discount status");

      setDiscounts(
        discounts.map((discount) =>
          discount._id === id
            ? { ...discount, isActive: !currentStatus }
            : discount
        )
      );

      toast({
        title: "Success",
        description: `Discount ${
          currentStatus ? "deactivated" : "activated"
        } successfully`,
      });
    } catch (error) {
      console.error("Error toggling discount status:", error);
      toast({
        title: "Error",
        description: "Failed to update discount status",
        variant: "destructive",
      });
    } finally {
      setIsTogglingStatus(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      setIsDeleting(true);

      const response = await fetch(`/api/admin/discounts/${deleteId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete discount");

      setDiscounts(discounts.filter((discount) => discount._id !== deleteId));

      toast({
        title: "Success",
        description: "Discount deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting discount:", error);
      toast({
        title: "Error",
        description: "Failed to delete discount",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  };

  const filteredDiscounts = discounts.filter((discount) =>
    discount.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className=" mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Discount Management</h1>
        <Link href="/admin/discounts/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add New Discount
          </Button>
        </Link>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Discounts</CardTitle>
          <CardDescription>
            Manage seasonal discounts, promo codes, and special offers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search discounts..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {filteredDiscounts.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No discounts found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Usage</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDiscounts.map((discount) => (
                    <TableRow key={discount._id}>
                      <TableCell className="font-medium">
                        {discount.code}
                      </TableCell>
                      <TableCell>
                        {discount.type === "percentage"
                          ? "Percentage"
                          : "Fixed Amount"}
                      </TableCell>
                      <TableCell>
                        {discount.type === "percentage"
                          ? `${discount.value}%`
                          : `Rs. ${discount.value}`}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                          <span>
                            {formatDate(discount.startDate)} -{" "}
                            {formatDate(discount.endDate)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={discount.isActive ? "default" : "outline"}
                          className="cursor-pointer"
                          onClick={() =>
                            handleToggleStatus(discount._id, discount.isActive)
                          }
                        >
                          {isTogglingStatus === discount._id ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : discount.isActive ? (
                            "Active"
                          ) : (
                            "Inactive"
                          )}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {discount.usageLimit
                          ? `${discount.usageCount}/${discount.usageLimit}`
                          : discount.usageCount}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              handleToggleStatus(
                                discount._id,
                                discount.isActive
                              )
                            }
                            disabled={isTogglingStatus === discount._id}
                          >
                            {discount.isActive ? (
                              <ToggleRight className="h-4 w-4" />
                            ) : (
                              <ToggleLeft className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              router.push(`/admin/discounts/${discount._id}`)
                            }
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setDeleteId(discount._id)}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Delete Discount
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete this discount?
                                  This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={handleDelete}
                                  disabled={isDeleting}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  {isDeleting ? (
                                    <>
                                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                      Deleting...
                                    </>
                                  ) : (
                                    "Delete"
                                  )}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
