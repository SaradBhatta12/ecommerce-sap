import mongoose from "mongoose"

const settingsSchema = new mongoose.Schema(
  {
    siteName: {
      type: String,
      default: "Nepali E-commerce",
    },
    logo: {
      type: String,
    },
    favicon: {
      type: String,
    },
    contactEmail: {
      type: String,
    },
    contactPhone: {
      type: String,
    },
    address: {
      type: String,
    },
    socialMedia: {
      facebook: String,
      instagram: String,
      twitter: String,
      youtube: String,
    },
    shippingMethods: [
      {
        name: String,
        price: Number,
        estimatedDelivery: String,
        isActive: {
          type: Boolean,
          default: true,
        },
      },
    ],
    paymentMethods: {
      cashOnDelivery: {
        type: Boolean,
        default: true,
      },
      esewa: {
        type: Boolean,
        default: false,
        merchantId: String,
        merchantSecret: String,
      },
      khalti: {
        type: Boolean,
        default: false,
        merchantId: String,
        merchantSecret: String,
      },
      bankTransfer: {
        type: Boolean,
        default: false,
        accountDetails: String,
      },
    },
    tax: {
      enable: {
        type: Boolean,
        default: true,
      },
      percentage: {
        type: Number,
        default: 13,
      },
    },
    currency: {
      code: {
        type: String,
        default: "NPR",
      },
      symbol: {
        type: String,
        default: "रू",
      },
    },
    metaTags: {
      title: String,
      description: String,
      keywords: [String],
    },
    maintenanceMode: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
)

const Settings = mongoose.models.Settings || mongoose.model("Settings", settingsSchema)

export default Settings
