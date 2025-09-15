import mongoose from "mongoose";
import slugify from "slugify";

const brandSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide a brand name"],
      trim: true,
      maxlength: [100, "Brand name cannot be more than 100 characters"],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      index: true,
    },
    description: {
      type: String,
      maxlength: [2000, "Description cannot be more than 2000 characters"],
    },
    logo: {
      type: String,
    },
    website: {
      type: String,
    },
    isActive: {
      type: Boolean,
      default: true,
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

// Create slug from name before saving
brandSchema.pre("save", function (next) {
  if (this.isModified("name")) {
    this.slug = slugify(this.name, { lower: true });
  }
  next();
});

// Update slug when name is updated
brandSchema.pre("findOneAndUpdate", async function (next) {
  const update = this.getUpdate() as any;
  if (update.name) {
    update.slug = slugify(update.name, { lower: true });
  }
  next();
});

const Brand = mongoose.models.Brand || mongoose.model("Brand", brandSchema);

export default Brand;
