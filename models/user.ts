import mongoose, { Schema, Document } from "mongoose";
import { hash, compare } from "bcryptjs";
import crypto from "crypto";
// Multi-tenant functionality removed - tenant imports disabled

interface EsewaDetails {
  merchantId: string;
  returnUrl: string;
  callbackUrl: string;
  paymentUrl: string;
  secretKey: string;
}
interface KhaltiDetails {
  publicKey: string;
  secretKey: string;
  returnUrl: string;
}

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  image?: string;
  role: "user" | "admin" | "superadmin";
  userType: "admin" | "user";
  provider?: string;
  providerId?: string;
  emailVerified?: Date;
  phone?: string;
  addresses: Array<{
    fullName: string;
    address: string;
    city: string;
    province: string;
    postalCode?: string;
    phone: string;
    landmark?: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
    isDefault: boolean;
  }>;
  notificationPreferences?: {
    email: boolean;
    marketing: boolean;
    orderUpdates: boolean;
    newProducts: boolean;
    wishlistReminders: boolean;
    priceDropAlerts: boolean;
    stockAlerts: boolean;
    reviewReminders: boolean;
  };
  vendorProfile?: {
    storeName: string;
    storeDescription?: string;
    banner?: string;
    logo?: string;
    businessType?: string;
    businessRegistrationNumber?: string;
    pickupAddress?: string;
    isApproved: boolean;
    contactEmail?: string;
    contactPhone?: string;
    bankDetails?: {
      accountName: string;
      accountNumber: string;
      bankName: string;
    };
    socialLinks?: {
      facebook?: string;
      instagram?: string;
      tiktok?: string;
      website?: string;
    };
    esewa?: EsewaDetails;
    khalti?: KhaltiDetails;
  };
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const addressSchema = new Schema({
  fullName: { type: String, required: true },
  address: { type: String, required: true },
  city: { type: String, required: true },
  province: { type: String, required: true },
  postalCode: { type: String },
  phone: { type: String, required: true },
  landmark: { type: String },
  coordinates: {
    lat: { type: Number },
    lng: { type: Number },
  },
  isDefault: { type: Boolean, default: false },
});

const vendorProfileSchema = new Schema({
  storeName: { type: String, required: true },
  storeDescription: { type: String },
  banner: { type: String },
  logo: { type: String },
  businessType: { type: String },
  businessRegistrationNumber: { type: String },
  pickupAddress: { type: String },
  isApproved: { type: Boolean, default: false },
  contactEmail: { type: String },
  contactPhone: { type: String },
  bankDetails: {
    accountName: { type: String },
    accountNumber: { type: String },
    bankName: { type: String },
  },
  socialLinks: {
    facebook: { type: String },
    instagram: { type: String },
    tiktok: { type: String },
    website: { type: String },
  },
  esewa: {
    merchantId: { type: String },
    returnUrl: { type: String },
    callbackUrl: { type: String },
    paymentUrl: { type: String },
    secretKey: { type: String },
  },
  khalti: {
    publicKey: { type: String },
    secretKey: { type: String },
    returnUrl: { type: String },
  },
});

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, select: false, required: false },
    image: { type: String },
    role: {
      type: String,
      enum: ["user", "admin", "superadmin"],
      default: "user",
    },
    userType: {
      type: String,
      enum: ["admin", "user"],
      required: true,
      default: "admin",
    },
    provider: {
      type: String,
      enum: ["credentials", "google", "facebook"],
      default: "credentials",
    },
    providerId: { type: String },
    emailVerified: { type: Date },
    phone: { type: String },
    addresses: [addressSchema],
    notificationPreferences: {
      email: { type: Boolean, default: true },
      marketing: { type: Boolean, default: false },
      orderUpdates: { type: Boolean, default: true },
      newProducts: { type: Boolean, default: false },
      wishlistReminders: { type: Boolean, default: true },
      priceDropAlerts: { type: Boolean, default: false },
      stockAlerts: { type: Boolean, default: true },
      reviewReminders: { type: Boolean, default: true },
    },
    vendorProfile: { type: vendorProfileSchema },
  },
  { timestamps: true }
);



// 🔒 Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password") || !this.password) return next();
  this.password = await hash(this.password, 12);
  next();
});



// 🔐 Compare password method
userSchema.methods.comparePassword = async function (
  candidatePassword: string
) {
  return await compare(candidatePassword, this.password);
};

export default mongoose.models.User ||
  mongoose.model<IUser>("User", userSchema);
