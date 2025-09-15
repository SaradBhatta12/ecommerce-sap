"use server";

import dbConnect from "@/lib/db-connect";
import Location from "@/models/locations";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import exceljs from "exceljs";
import mongoose, { Types } from "mongoose";
import { getCurrentUserId } from "@/lib/auth-utils";

// ---------- Types ----------
type LocationType = "country" | "province" | "city" | "landmark";

interface LocationInput {
  name: string;
  type: LocationType;
  parent?: string;
  shippingPrice?: number;
}

interface LocationUpdateInput {
  name?: string;
  shippingPrice?: number;
}

interface SerializedLocation {
  _id: string;
  name: string;
  type: string;
  parent: string | null;
  shippingPrice: number;
  path: string;
}

interface ExcelLocationRow {
  path: string;
  shippingPrice: number;
}

// ---------- Serialize Location ----------
const serializeLocation = (loc: any): SerializedLocation => ({
  _id: loc._id.toString(),
  name: loc.name,
  type: loc.type,
  parent: loc.parent ? loc.parent.toString() : null,
  shippingPrice: loc.shippingPrice,
  path: loc.path,
});

// ---------- Create Location ----------
export const createLocation = async (
  data: LocationInput
): Promise<SerializedLocation> => {
  const adminId = await getCurrentUserId();
  await dbConnect();
  const location = new Location({
    ...data,
    admin: new mongoose.Types.ObjectId(adminId),
  });
  await location.save();
  revalidatePath("/");
  return serializeLocation(location);
};

// ---------- Get Full Location Tree ----------
export const getLocationTree = async (): Promise<any[]> => {
  const adminId = await getCurrentUserId();

  await dbConnect();

  const buildTree = async (parentId: string | null = null): Promise<any[]> => {
    const children = await Location.find({
      parent: parentId,
      admin: new mongoose.Types.ObjectId(adminId),
    }).lean();
    return Promise.all(
      children.map(async (child) => ({
        ...serializeLocation(child),
        children: await buildTree(String(child._id)),
      }))
    );
  };

  return buildTree();
};

// ---------- Update Location ----------
export const updateLocation = async (
  id: string,
  data: LocationUpdateInput
): Promise<SerializedLocation | null> => {
  const adminId = await getCurrentUserId();

  await dbConnect();
  const updated = await Location.findByIdAndUpdate(id, data, {
    new: true,
    updatedBy: new mongoose.Types.ObjectId(adminId),
  }).lean();
  revalidatePath("/");
  return updated ? serializeLocation(updated) : null;
};

// ---------- Delete Location ----------
export const deleteLocation = async (id: string): Promise<void> => {
  const adminId = await getCurrentUserId();

  await dbConnect();
  await Location.findByIdAndDelete(id, {
    updatedBy: new mongoose.Types.ObjectId(adminId),
  });
  revalidatePath("/");
};

// ---------- Export to Excel ----------
export const exportLocations = async (): Promise<Buffer> => {
  const adminId = await getCurrentUserId();

  await dbConnect();
  const locations = await Location.find({
    admin: new mongoose.Types.ObjectId(adminId),
  }).lean();

  const workbook = new exceljs.Workbook();
  const worksheet = workbook.addWorksheet("Locations");

  worksheet.columns = [
    { header: "ID", key: "_id", width: 30 },
    { header: "Name", key: "name", width: 30 },
    { header: "Type", key: "type", width: 15 },
    { header: "Path", key: "path", width: 50 },
    { header: "Shipping Price", key: "shippingPrice", width: 15 },
  ];

  locations.forEach((loc) => {
    worksheet.addRow({
      _id: String(loc._id),
      name: loc.name,
      type: loc.type,
      path: loc.path,
      shippingPrice: loc.shippingPrice ?? 0,
    });
  });

  const buffer = await workbook.xlsx.writeBuffer();
  return buffer as Buffer;
};

// ---------- Import from Excel ----------
export const importLocations = async (formData: FormData): Promise<void> => {
  const adminId = await getCurrentUserId();

  await dbConnect();

  const file = formData.get("file");
  if (!file || !(file instanceof File)) {
    throw new Error("Invalid file upload");
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const workbook = new exceljs.Workbook();
  await workbook.xlsx.load(buffer);

  const worksheet = workbook.worksheets[0];
  const rows: ExcelLocationRow[] = [];

  worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
    if (rowNumber === 1) return; // Skip header

    const pathCell = row.getCell(4).text?.trim();
    const priceCell = row.getCell(5).value;

    if (!pathCell) return;

    const shippingPrice =
      typeof priceCell === "number" ? priceCell : Number(priceCell) || 0;

    rows.push({
      path: pathCell,
      shippingPrice,
    });
  });

  // Clear existing locations
  await Location.deleteMany({ admin: new mongoose.Types.ObjectId(adminId) });
  const pathMap = new Map<string, Types.ObjectId>();
  for (const row of rows) {
    const pathParts = row.path.split("/");
    const name = pathParts[pathParts.length - 1];
    const type: LocationType = ["country", "province", "city", "landmark"][
      pathParts.length - 1
    ] as LocationType;

    let parent: Types.ObjectId | null = null;

    if (pathParts.length > 1) {
      const parentPath = pathParts.slice(0, -1).join("/");
      parent = pathMap.get(parentPath) || null;
    }

    const location = new Location({
      admin: new mongoose.Types.ObjectId(adminId),
      name,
      type,
      parent,
      shippingPrice: type === "landmark" ? row.shippingPrice : 0,
    });

    await location.save();
    pathMap.set(row.path, location._id);
  }

  revalidatePath("/");
  redirect("/");
};
