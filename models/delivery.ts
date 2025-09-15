import mongoose from "mongoose";

const deliverySchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "processing", "shipped", "delivered", "failed"],
      default: "pending",
    },
    trackingNumber: {
      type: String,
    },
    carrier: {
      type: String,
    },
    estimatedDeliveryDate: {
      type: Date,
    },
    actualDeliveryDate: {
      type: Date,
    },
    shippingMethod: {
      type: String,
      required: true,
    },
    deliveryPerson: {
      name: String,
      phone: String,
      email: String,
    },
    notes: {
      type: String,
    },
    trackingHistory: [
      {
        status: String,
        location: String,
        timestamp: {
          type: Date,
          default: Date.now,
        },
        notes: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Delivery =
  mongoose.models.Delivery || mongoose.model("Delivery", deliverySchema);

export default Delivery;
