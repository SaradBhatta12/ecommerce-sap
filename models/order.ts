import mongoose, { Schema, type Document } from "mongoose";

export interface IOrderItem {
  product: mongoose.Types.ObjectId;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export interface IOrder extends Document {
  user: mongoose.Types.ObjectId;
  items: IOrderItem[];
  address: {
    fullName: string;
    address: string;
    city: string;
    province: string;
    postalCode?: string;
    phone: string;
  };
  paymentMethod: string;
  paymentStatus: "pending" | "paid" | "failed";
  paymentDetails?: {
    transactionId?: string;
    provider?: string;
    amount?: number;
    currency?: string;
    status?: string;
    referenceId?: string;
    metadata?: any;
  };
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  subtotal: number;
  shipping: number;
  discount?: {
    id: mongoose.Types.ObjectId;
    code: string;
    amount: number;
  };
  total: number;
  trackingNumber?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const orderSchema = new Schema<IOrder>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [
      {
        product: {
          type: Schema.Types.ObjectId,
          ref: "Product",
        },
        name: {
          type: String,
          required: true,
        },
        price: {
          type: Number,
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        image: {
          type: String,
        },
      },
    ],
    address: {
      fullName: {
        type: String,
        required: true,
      },
      address: {
        type: String,
        required: true,
      },
      city: {
        type: String,
        required: true,
      },
      province: {
        type: String,
        required: true,
      },
      postalCode: {
        type: String,
      },
      phone: {
        type: String,
        required: true,
      },
    },
    paymentMethod: {
      type: String,
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },
    paymentDetails: {
      transactionId: String,
      provider: String,
      amount: Number,
      currency: String,
      status: String,
      referenceId: String,
      metadata: Schema.Types.Mixed,
    },
    status: {
      type: String,
      enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
    subtotal: {
      type: Number,
      required: true,
    },
    shipping: {
      type: Number,
      required: true,
    },
    discount: {
      id: {
        type: Schema.Types.ObjectId,
        ref: "Discount",
      },
      code: String,
      amount: Number,
    },
    total: {
      type: Number,
      required: true,
    },
    trackingNumber: {
      type: String,
    },
    notes: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const Order =
  mongoose.models.Order || mongoose.model<IOrder>("Order", orderSchema);

export default Order;
