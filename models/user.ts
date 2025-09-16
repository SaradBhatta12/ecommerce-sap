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
    _id?: string;
    fullName: string;
    address: string;
    district: string;
    province: string;
    locality?: string;
    postalCode?: string;
    phone: string;
    alternatePhone?: string;
    landmark?: string;
    addressType: "home" | "office" | "other";
    coordinates?: {
      lat: number;
      lng: number;
    };
    isDefault: boolean;
    isActive: boolean;
    deliveryInstructions?: string;
    createdAt?: Date;
    updatedAt?: Date;
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
  fullName: { 
    type: String, 
    required: [true, 'Full name is required'],
    trim: true,
    minlength: [2, 'Full name must be at least 2 characters'],
    maxlength: [100, 'Full name cannot exceed 100 characters']
  },
  address: { 
    type: String,
    trim: true,
    maxlength: [500, 'Address cannot exceed 500 characters']
  },
  district: { 
    type: String,
    trim: true,
    maxlength: [100, 'District name cannot exceed 100 characters']
  },
  province: { 
    type: String,
    trim: true,
    maxlength: [100, 'Province name cannot exceed 100 characters']
  },
  locality: { 
    type: String,
    trim: true,
    maxlength: [100, 'Locality name cannot exceed 100 characters']
  },
  postalCode: { 
    type: String,
    trim: true,
    validate: {
      validator: function(v: string) {
        return !v || /^\d{5}$/.test(v);
      },
      message: 'Postal code must be 5 digits'
    }
  },
  phone: { 
    type: String,
    required: [true, 'Phone number is required'],
    validate: {
      validator: function(v: string) {
        return /^(9[678]\d{8})$/.test(v);
      },
      message: 'Please enter a valid Nepali phone number (98xxxxxxxx)'
    }
  },
  alternatePhone: { 
    type: String,
    validate: {
      validator: function(v: string) {
        return !v || /^(9[678]\d{8})$/.test(v);
      },
      message: 'Please enter a valid Nepali phone number (98xxxxxxxx)'
    }
  },
  landmark: { 
    type: String,
    trim: true,
    maxlength: [200, 'Landmark cannot exceed 200 characters']
  },
  addressType: {
    type: String,
    enum: {
      values: ['home', 'office', 'other'],
      message: 'Address type must be home, office, or other'
    },
    default: 'home'
  },
  coordinates: {
    lat: { 
      type: Number,
      min: [-90, 'Latitude must be between -90 and 90'],
      max: [90, 'Latitude must be between -90 and 90']
    },
    lng: { 
      type: Number,
      min: [-180, 'Longitude must be between -180 and 180'],
      max: [180, 'Longitude must be between -180 and 180']
    },
  },
  isDefault: { 
    type: Boolean, 
    default: false 
  },
  isActive: { 
    type: Boolean, 
    default: true 
  },
  deliveryInstructions: { 
    type: String,
    trim: true,
    maxlength: [300, 'Delivery instructions cannot exceed 300 characters']
  }
}, {
  timestamps: true
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
