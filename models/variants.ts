import mongoose from "mongoose";
import crypto from "crypto";

const variantSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    value: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
    },
    parantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "variant",
      default: null,
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    sortOrder: {
      type: Number,
      default: 0,
      index: true,
    },
    productCount: {
      type: Number,
      default: 0,
    },
    slug: {
      type: String,
      unique: true,
      index: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

// Create compound index for better query performance
variantSchema.index({ type: 1, isActive: 1, sortOrder: 1 });
variantSchema.index({ name: "text", value: "text" });

// Pre-save middleware to generate slug
variantSchema.pre("save", function (next) {
  if (this.isModified("name") || this.isModified("value")) {
    this.slug = `${this.name}-${this.value}-${crypto
      .randomBytes(4)
      .toString("hex")}`
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }
  next();
});

// Virtual for formatted display name
variantSchema.virtual("displayName").get(function () {
  return `${this.name} (${this.value})`;
});

export const variant =
  mongoose.models.variant || mongoose.model("variant", variantSchema);
