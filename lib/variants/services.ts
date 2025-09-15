import dbConnect from "../db-connect";
import { variant } from "@/models/variants";
import product from "@/models/product";
import type { FilterQuery } from "mongoose";

export interface VariantFilters {
  type?: string;
  isActive?: boolean;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}

export class VariantService {
  static async getVariants(filters: VariantFilters = {}) {
    await dbConnect();

    const {
      isActive,
      search,
      sortBy = "sortOrder",
      sortOrder = "asc",
      page = 1,
      limit = 50,
    } = filters;

    // Build query
    const query: FilterQuery<any> = {};

    if (typeof isActive === "boolean") {
      query.isActive = isActive;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { value: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    // Build sort
    const sort: Record<string, 1 | -1> = {};
    sort[sortBy] = sortOrder === "asc" ? 1 : -1;

    // Pagination
    const skip = (page - 1) * limit;

    // Aggregate variants with parent info
    const [variants, total] = await Promise.all([
      variant.aggregate([
        { $match: query },
        { $sort: sort },
        { $skip: skip },
        { $limit: limit },

        // Lookup parent variant
        {
          $lookup: {
            from: "variants", // collection name
            localField: "parantId",
            foreignField: "_id",
            as: "parent",
          },
        },
        {
          $unwind: {
            path: "$parent",
            preserveNullAndEmptyArrays: true,
          },
        },
      ]),

      variant.countDocuments(query),
    ]);

    // Product count for each variant
    const variantIds = variants.map((v) => v._id);
    const productCounts = await product.aggregate([
      { $unwind: "$variants" },
      { $match: { "variants.variantId": { $in: variantIds } } },
      { $group: { _id: "$variants.variantId", count: { $sum: 1 } } },
    ]);

    const countMap = new Map(
      productCounts.map((pc) => [pc._id.toString(), pc.count])
    );

    // Attach product count to each variant
    const variantsWithCounts = variants.map((variant) => ({
      ...variant,
      productCount: countMap.get(variant._id.toString()) || 0,
    }));

    return {
      variants: variantsWithCounts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  static async getVariantById(id: string) {
    await dbConnect();

    const Variant = await variant.findById(id).lean();
    if (!Variant || Array.isArray(Variant)) {
      throw new Error("Variant not found");
    }

    // Get product count
    const productCount = await product.countDocuments({
      "variants.variantId": Variant?._id,
    });

    return {
      ...Variant,
      productCount,
    };
  }

  static async createVariant(data: any) {
    await dbConnect();

    // Check for duplicate name + value combination
    const existing = await variant.findOne({
      name: data.name,
      value: data.value,
    });

    if (existing) {
      throw new Error("A variant with this name and value already exists");
    }

    const Variant = new variant(data);
    await Variant.save();

    return Variant.toObject();
  }

  static async updateVariant(id: string, data: any) {
    await dbConnect();

    // Check for duplicate name + value combination (excluding current variant)
    if (data.name || data.value) {
      const existing = await variant.findOne({
        _id: { $ne: id },
        name: data.name,
        value: data.value,
      });

      if (existing) {
        throw new Error("A variant with this name and value already exists");
      }
    }

    const Variant = await variant.findByIdAndUpdate(
      id,
      { ...data, "metadata.updatedBy": data.updatedBy },
      { new: true, runValidators: true }
    );

    if (!Variant) {
      throw new Error("Variant not found");
    }

    return Variant.toObject();
  }

  static async deleteVariant(id: string) {
    await dbConnect();

    // Check if variant is used in any products
    const productCount = await product.countDocuments({
      "variants.variantId": id,
    });

    if (productCount > 0) {
      throw new Error(
        `Cannot delete variant. It is used in ${productCount} product(s)`
      );
    }

    const Variant = await variant.findByIdAndDelete(id);
    if (!Variant) {
      throw new Error("Variant not found");
    }

    return { success: true };
  }

  static async getVariantStats() {
    await dbConnect();

    const stats = await variant.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          active: { $sum: { $cond: ["$isActive", 1, 0] } },
          inactive: { $sum: { $cond: ["$isActive", 0, 1] } },
        },
      },
    ]);

    const typeStats = await variant.aggregate([
      {
        $group: {
          _id: "$type",
          count: { $sum: 1 },
        },
      },
    ]);

    return {
      total: stats[0]?.total || 0,
      active: stats[0]?.active || 0,
      inactive: stats[0]?.inactive || 0,
      byType: typeStats.reduce((acc, stat) => {
        acc[stat._id] = stat.count;
        return acc;
      }, {} as Record<string, number>),
    };
  }

  static async bulkUpdateVariants(ids: string[], updates: any) {
    await dbConnect();

    const result = await variant.updateMany(
      { _id: { $in: ids } },
      { ...updates, "metadata.updatedBy": updates.updatedBy }
    );

    return result;
  }

  static async duplicateVariant(id: string, newData: Partial<any> = {}) {
    await dbConnect();

    const original = await variant.findById(id);
    if (!original) {
      throw new Error("Original variant not found");
    }

    const duplicateData = {
      ...original.toObject(),
      ...newData,
      _id: undefined,
      name: newData.name || `${original.name} (Copy)`,
      slug: undefined, // Will be regenerated
      createdAt: undefined,
      updatedAt: undefined,
      productCount: 0,
    };

    return this.createVariant(duplicateData);
  }
}
