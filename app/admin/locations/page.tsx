"use client";
import React, { useState, useEffect } from "react";
import { Plus, Trash2, Edit, Download, Upload } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  createLocation,
  getLocationTree,
  updateLocation,
  deleteLocation,
  exportLocations,
  importLocations,
} from "./_action";

export default function LocationTree() {
  const [tree, setTree] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newItem, setNewItem] = useState({ name: "", shippingPrice: 0 });
  const [currentParent, setCurrentParent] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentItem, setCurrentItem] = useState<any>(null);

  // Fetch location tree
  const fetchTree = async () => {
    try {
      const data = await getLocationTree();
      setTree(data);
    } catch (error) {
      toast.error("Failed to load locations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTree();
  }, []);

  // Handle create/update submission
  const handleSubmit = async () => {
    try {
      if (editMode && currentItem) {
        await updateLocation(currentItem._id, {
          name: newItem.name,
          ...(currentItem.type === "landmark" && {
            shippingPrice: newItem.shippingPrice,
          }),
        });
        toast.success("Location updated");
      } else {
        let type: "country" | "province" | "city" | "landmark" = "country";

        if (currentParent) {
          const parent = findItemById(tree, currentParent);
          if (!parent) throw new Error("Parent not found");

          if (parent.type === "country") type = "province";
          else if (parent.type === "province") type = "city";
          else if (parent.type === "city") type = "landmark";
        }

        await createLocation({
          name: newItem.name,
          type,
          parent: currentParent || undefined,
          ...(type === "landmark" && { shippingPrice: newItem.shippingPrice }),
        });

        toast.success(
          `${type.charAt(0).toUpperCase() + type.slice(1)} created successfully`
        );
      }

      setDialogOpen(false);
      fetchTree();
    } catch (error: any) {
      toast.error(error.message || "Operation failed");
    }
  };

  // Handle delete
  const handleDelete = async (id: string) => {
    if (confirm("Are you sure? This will delete all children locations!")) {
      try {
        await deleteLocation(id);
        toast.success("Location deleted");
        fetchTree();
      } catch (error) {
        toast.error("Deletion failed");
      }
    }
  };

  // Handle export
  const handleExport = async () => {
    try {
      const buffer = await exportLocations();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "locations.xlsx";
      document.body.appendChild(a);
      a.click();
      a.remove();
      toast.success("Export completed");
    } catch (error) {
      toast.error("Export failed");
    }
  };

  // Handle import
  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append("file", file);
      await importLocations(formData);
      toast.success("Import completed");
      fetchTree();
    } catch (error) {
      toast.error("Import failed");
    }
  };

  // Open dialog for create/edit
  const openDialog = (parentId: string | null = null, item: any = null) => {
    setCurrentParent(parentId);

    if (item) {
      setEditMode(true);
      setCurrentItem(item);
      setNewItem({
        name: item.name,
        shippingPrice: item.shippingPrice || 0,
      });
    } else {
      setEditMode(false);
      setCurrentItem(null);
      setNewItem({ name: "", shippingPrice: 0 });
    }

    setDialogOpen(true);
  };

  // Recursive tree renderer
  const renderTree = (nodes: any[], level = 0) => {
    return nodes.map((node) => {
      const nextType =
        node.type === "country"
          ? "Province"
          : node.type === "province"
          ? "City"
          : node.type === "city"
          ? "Landmark"
          : null;

      return (
        <AccordionItem value={node._id} key={node._id} className="border-b-0">
          <div className="flex items-center gap-2  p-2 rounded-md">
            <AccordionTrigger className="flex-1 py-1 hover:no-underline">
              <div className="flex items-center gap-2">
                <Plus className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{node.name}</span>
                {node.type === "landmark" && (
                  <span className="text-sm text-green-600 ml-2">
                    NPR. {node.shippingPrice}
                  </span>
                )}
              </div>
            </AccordionTrigger>
            <div className="flex gap-1">
              {nextType && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => openDialog(node._id)}
                  title={`Add ${nextType}`}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => openDialog(null, node)}
                title="Edit"
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDelete(node._id)}
                title="Delete"
              >
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </div>
          </div>

          <AccordionContent className="ml-6 pl-4 border-l-2 border-gray-200">
            {node.children?.length > 0 ? (
              <Accordion type="multiple" className="space-y-2">
                {renderTree(node.children, level + 1)}
              </Accordion>
            ) : nextType ? (
              <div className="text-sm text-muted-foreground py-2">
                No {nextType.toLowerCase()}s added yet
              </div>
            ) : null}

            {nextType && (
              <Button
                variant="link"
                className="mt-2 text-blue-500 pl-0"
                onClick={() => openDialog(node._id)}
              >
                <Plus className="h-4 w-4 mr-1" /> Add {nextType}
              </Button>
            )}
          </AccordionContent>
        </AccordionItem>
      );
    });
  };

  return (
    <div className="mx-auto ">
      <Card>
        <CardHeader>
          <div className="flex items-center flex-col gap-1 md:justify-between md:flex-row">
            <CardTitle>Location Tree Management</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleExport}>
                <Download className="h-4 w-4 mr-2" /> Export
              </Button>
              <Button asChild variant="outline">
                <label>
                  <Upload className="h-4 w-4 mr-2" /> Import
                  <input
                    type="file"
                    className="hidden"
                    accept=".xlsx,.xls"
                    onChange={handleImport}
                  />
                </label>
              </Button>
              <Button onClick={() => openDialog()}>
                <Plus className="h-4 w-4 mr-2" /> Add Country
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading locations...</div>
          ) : tree.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">No locations found</p>
              <Button onClick={() => openDialog()}>Create First Country</Button>
            </div>
          ) : (
            <Accordion type="multiple" className="space-y-2">
              {renderTree(tree)}
            </Accordion>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editMode
                ? "Edit Location"
                : currentParent
                ? "Add Location"
                : "Add Country"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <Input
              placeholder="Name"
              value={newItem.name}
              onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
            />

            {(currentItem?.type === "landmark" ||
              (!editMode &&
                currentParent &&
                findItemById(tree, currentParent)?.type === "city")) && (
              <Input
                type="number"
                placeholder="Shipping Price"
                value={newItem.shippingPrice}
                onChange={(e) =>
                  setNewItem({
                    ...newItem,
                    shippingPrice: Number(e.target.value),
                  })
                }
                min="0"
              />
            )}

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={
                  !newItem.name ||
                  (currentItem?.type === "landmark" &&
                    isNaN(newItem.shippingPrice))
                }
              >
                {editMode ? "Update" : "Create"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Helper to find item in tree
function findItemById(nodes: any[], id: string): any | null {
  for (const node of nodes) {
    if (node._id === id) return node;
    if (node.children) {
      const found = findItemById(node.children, id);
      if (found) return found;
    }
  }
  return null;
}
