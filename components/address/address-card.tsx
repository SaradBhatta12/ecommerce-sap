"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useParams } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  Home,
  MapPin,
  MoreVertical,
  Navigation,
  Phone,
  Trash,
  Edit,
} from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface AddressCardProps {
  address: {
    _id: string;
    fullName: string;
    address: string;
    district: string;
    province: string;
    postalCode?: string;
    phone: string;
    landmark?: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
    isDefault: boolean;
  };
}

export function AddressCard({ address }: AddressCardProps) {
  const router = useRouter();

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSettingDefault, setIsSettingDefault] = useState(false);
  const [showMap, setShowMap] = useState(false);

  console.log(address);
  const handleSetDefault = async () => {
    if (address.isDefault) return;

    try {
      setIsSettingDefault(true);
      const response = await fetch(
        `/api/user/addresses/${address._id}/default`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to set default address");
      }

      toast.success("Default Address Updated", {
        description: "This address has been set as your default address",
      });

      router.refresh();
    } catch (error) {
      console.error("Error setting default address:", error);
      toast.error("Error", {
        description: "Failed to set default address. Please try again.",
      });
    } finally {
      setIsSettingDefault(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      const response = await fetch(`/api/user/addresses/${address._id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete address");
      }

      toast.success("Address Deleted", {
        description: "Your address has been deleted successfully",
      });

      setIsDeleteDialogOpen(false);
      router.refresh();
    } catch (error) {
      console.error("Error deleting address:", error);
      toast.error("Error", {
        description: "Failed to delete address. Please try again.",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Card
        className={`overflow-hidden ${
          address.isDefault ? "border-primary" : ""
        }`}
      >
        {address.isDefault && (
          <div className="bg-primary px-4 py-1 text-xs text-primary-foreground flex items-center">
            <CheckCircle className="h-3 w-3 mr-1" />
            Default Address
          </div>
        )}
        <CardContent className="p-6">
          <div className="flex justify-between items-start">
            <h3 className="font-medium text-lg">{address.fullName}</h3>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link
                    href={`/dashboard/addresses/${address._id}/edit`}
                    className="cursor-pointer"
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Address
                  </Link>
                </DropdownMenuItem>
                {!address.isDefault && (
                  <DropdownMenuItem
                    onClick={handleSetDefault}
                    disabled={isSettingDefault}
                    className="cursor-pointer"
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Set as Default
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => setIsDeleteDialogOpen(true)}
                  className="text-destructive focus:text-destructive cursor-pointer"
                >
                  <Trash className="mr-2 h-4 w-4" />
                  Delete Address
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="mt-4 space-y-2 text-sm">
            <div className="flex items-start">
              <MapPin className="h-4 w-4 mr-2 mt-0.5 text-muted-foreground shrink-0" />
              <div>
                <p>{address.address}</p>
                <p>
                  {address.district}, {address.province}{address.postalCode ? ` ${address.postalCode}` : ''}
                </p>
              </div>
            </div>

            {address.landmark && (
              <div className="flex items-start">
                <Home className="h-4 w-4 mr-2 mt-0.5 text-muted-foreground shrink-0" />
                <p>{address.landmark}</p>
              </div>
            )}

            <div className="flex items-center">
              <Phone className="h-4 w-4 mr-2 text-muted-foreground shrink-0" />
              <p>{address.phone}</p>
            </div>
          </div>

          {address.coordinates && address.coordinates.lat !== 27.7172 && (
            <Badge
              variant="outline"
              className="mt-4 cursor-pointer"
              onClick={() => setShowMap(true)}
            >
              <Navigation className="h-3 w-3 mr-1" />
              View on Map
            </Badge>
          )}
        </CardContent>
        <CardFooter className="px-6 py-4 bg-muted/50 flex justify-between">
          <Button variant="outline" asChild>
            <Link href={`/dashboard/addresses/${address._id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </Button>
          {!address.isDefault && (

            
            <Button
              variant="default"
              onClick={handleSetDefault}
              disabled={isSettingDefault}
            >
              Set as Default
            </Button>
          )}
        </CardFooter>
      </Card>

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this address. This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {address.coordinates && (
        <Dialog open={showMap} onOpenChange={setShowMap}>
          <DialogContent className="sm:max-w-[500px]">
            <div className="aspect-video w-full rounded-md overflow-hidden border">
              <iframe
                width="100%"
                height="100%"
                frameBorder="0"
                style={{ border: 0 }}
                src={`https://www.google.com/maps/embed/v1/place?key=YOUR_API_KEY&q=${address.coordinates.lat},${address.coordinates.lng}&zoom=16`}
                allowFullScreen
              ></iframe>
            </div>
            <div className="text-sm text-muted-foreground mt-2">
              <p className="font-medium">{address.fullName}</p>
              <p>{address.address}</p>
              <p>
                {address.district}, {address.province}{address.postalCode ? ` ${address.postalCode}` : ''}
              </p>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
