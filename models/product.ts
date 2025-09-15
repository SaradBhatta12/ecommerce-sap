import mongoose, { Schema, type Document } from "mongoose";
import { slugify } from "@/lib/utils";

export interface IVariantType {
  inventory_type: string;
  value: string;
}

export interface IVariantImage {
  caption: string;
  document: string;
}

export interface IVariant {
  barcode?: string;
  sku_of_match?: string;
  sku_from_system?: string;
  variant_type: IVariantType[];
  is_available?: boolean;
  stock_status?: mongoose.Types.ObjectId | null;
  image?: IVariantImage[];
  inventory?: number;
  max_order?: number;
  min_order?: number;
  min_stock_warning?: number;
  price?: number;
  sales_price?: number;
  actual_price?: number;
  actual_sales_price?: number;
  is_active?: boolean;
}

export interface IProduct {
  name: string;
  slug: string;
  description: string;
  price: number;
  discountPrice?: number;
  stock: number;
  images: string[];
  category: mongoose.Types.ObjectId;
  brand?: mongoose.Types.ObjectId;
  tags?: string[];
  variant: IVariant[];
  attributes?: Record<string, any>;
  rating?: number;
  reviews?: number;
  isNew?: boolean;
  isFeatured?: boolean;
  isOnSale?: boolean;
  discount?: number;
  sku: string;
  barcode?: string;
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  shippingClass?: string;
  taxClass?: string;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string[];
  status: "draft" | "published" | "archived";
  visibility: "public" | "private" | "password-protected";
  createdBy: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;

  // 2035 E-commerce features
  arModel?: string;
  vrExperience?: string;
  threeDModel?: string;
  digitalAssets?: {
    type: string;
    url: string;
    accessType: "download" | "stream" | "subscription";
  }[];
  customizationOptions?: {
    name: string;
    options: string[];
    priceModifiers?: Record<string, number>;
  }[];
  sustainabilityScore?: number;
  carbonFootprint?: number;
  recycledMaterials?: boolean;
  aiGeneratedDescription?: string;
  aiTags?: string[];
  voiceSearchKeywords?: string[];
  relatedProducts?: mongoose.Types.ObjectId[];
  bundleProducts?: {
    product: mongoose.Types.ObjectId;
    quantity: number;
    discountPercentage?: number;
  }[];
  subscriptionOptions?: {
    interval: "daily" | "weekly" | "monthly" | "quarterly" | "yearly";
    price: number;
    discountPercentage?: number;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: [true, "Please provide a product name"],
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
      required: [true, "Please provide a product description"],
    },
    price: {
      type: Number,
      required: [true, "Please provide a product price"],
      min: 0,
    },
    discountPrice: {
      type: Number,
      min: 0,
    },
    stock: {
      type: Number,
      required: [true, "Please provide product stock"],
      min: 0,
      default: 0,
    },
    images: {
      type: [String],
      required: [true, "Please provide at least one product image"],
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Please provide a product category"],
    },
    brand: {
      type: Schema.Types.ObjectId,
      ref: "Brand",
    },
    tags: {
      type: [String],
    },
    variant: [
      {
        // sku_of_seller: { type: String },
        barcode: { type: String },
        sku_of_match: { type: String },
        sku_from_system: { type: String },
        variant_type: [
          { inventory_type: { type: String }, value: { type: String } },
        ],
        is_available: { type: Boolean, default: false },
        stock_status: {
          type: mongoose.Types.ObjectId,
          required: false,
          ref: "stockStatus",
          default: null,
        },
        image: {
          type: [
            {
              caption: String,
              document: {
                type: String,
                get: (value: any) => value?.toString() || "",
                set: (value: any) => value?.toString() || "",
              },
            },
          ],
          default: [],
        },

        inventory: { type: Number, default: 0 },
        max_order: { type: Number, default: 0 },
        min_order: { type: Number, default: 0 },
        min_stock_warning: { type: Number, default: 0 },
        price: { type: Number, default: 0 },
        sales_price: { type: Number, default: 0 },
        actual_price: { type: Number, default: 0 },
        actual_sales_price: { type: Number, default: 0 },
        is_active: { type: Boolean, default: false },
      },
    ],

    attributes: {
      type: Map,
      of: Schema.Types.Mixed,
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
    reviews: {
      type: Number,
      default: 0,
    },
    isNew: {
      type: Boolean,
      default: false,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isOnSale: {
      type: Boolean,
      default: false,
    },
    discount: {
      type: Number,
      min: 0,
      max: 100,
    },
    sku: {
      type: String,
      required: [true, "Please provide a product SKU"],
      unique: true,
    },
    barcode: {
      type: String,
    },
    weight: {
      type: Number,
      min: 0,
    },
    dimensions: {
      length: {
        type: Number,
        min: 0,
      },
      width: {
        type: Number,
        min: 0,
      },
      height: {
        type: Number,
        min: 0,
      },
    },
    shippingClass: {
      type: String,
    },
    taxClass: {
      type: String,
    },
    metaTitle: {
      type: String,
    },
    metaDescription: {
      type: String,
    },
    metaKeywords: {
      type: [String],
    },
    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "draft",
    },
    visibility: {
      type: String,
      enum: ["public", "private", "password-protected"],
      default: "public",
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },

    // 2035 E-commerce features
    arModel: {
      type: String,
    },
    vrExperience: {
      type: String,
    },
    threeDModel: {
      type: String,
    },
    digitalAssets: [
      {
        type: {
          type: String,
          required: true,
        },
        url: {
          type: String,
          required: true,
        },
        accessType: {
          type: String,
          enum: ["download", "stream", "subscription"],
          default: "download",
        },
      },
    ],
    customizationOptions: [
      {
        name: {
          type: String,
          required: true,
        },
        options: {
          type: [String],
          required: true,
        },
        priceModifiers: {
          type: Map,
          of: Number,
        },
      },
    ],
    sustainabilityScore: {
      type: Number,
      min: 0,
      max: 100,
    },
    carbonFootprint: {
      type: Number,
      min: 0,
    },
    recycledMaterials: {
      type: Boolean,
      default: false,
    },
    aiGeneratedDescription: {
      type: String,
    },
    aiTags: {
      type: [String],
    },
    voiceSearchKeywords: {
      type: [String],
    },
    relatedProducts: [
      {
        type: Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
    bundleProducts: [
      {
        product: {
          type: Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        discountPercentage: {
          type: Number,
          min: 0,
          max: 100,
        },
      },
    ],
    subscriptionOptions: [
      {
        interval: {
          type: String,
          enum: ["daily", "weekly", "monthly", "quarterly", "yearly"],
          required: true,
        },
        price: {
          type: Number,
          required: true,
          min: 0,
        },
        discountPercentage: {
          type: Number,
          min: 0,
          max: 100,
        },
      },
    ],
  },
  {
    suppressReservedKeysWarning: true,
    timestamps: true,
  }
);

// Create slug from name before saving
productSchema.pre("save", function (next) {
  if (!this.slug || this.isModified("name")) {
    this.slug = slugify(this.name);
  }

  // Calculate discount price if on sale
  if (this.isOnSale && this.discount) {
    this.discountPrice = this.price - (this.price * this.discount) / 100;
  } else {
    this.discountPrice = undefined;
  }

  next();
});

export default mongoose.models.Product ||
  mongoose.model<IProduct>("Product", productSchema);
