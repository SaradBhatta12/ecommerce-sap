import mongoose from "mongoose";
import slugify from "slugify";

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide a category name"],
      trim: true,
      maxlength: [100, "Category name cannot be more than 100 characters"],
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
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      default: null,
    },
    image: {
      type: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    order: {
      type: Number,
      default: 0,
    },
    admin: {
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
categorySchema.pre("save", async function (next) {
  if (this.isModified("name")) {
    let slug = slugify(this.name, { lower: true });
    let counter = 0;
    // Check for existing slug
    while (true) {
      const slugExists = await mongoose.models.Category.findOne({
        slug: counter ? `${slug}-${counter}` : slug,
      });
      if (!slugExists) {
        this.slug = counter ? `${slug}-${counter}` : slug;
        break;
      }
      counter++;
    }
  }
  next();
});

// Update slug when name is updated
categorySchema.pre("findOneAndUpdate", async function (next) {
  const update = this.getUpdate() as any;
  if (update.name) {
    update.slug = slugify(update.name, { lower: true });
  }
  next();
});

const Category =
  mongoose.models.Category || mongoose.model("Category", categorySchema);

export default Category;
