"use server";

import { getCurrentUserId } from "@/lib/auth-utils";
import dbConnect from "@/lib/db-connect";
import { protocol } from "@/lib/utils";
import User from "@/models/user";
import mongoose from "mongoose";
import nodemailer from "nodemailer";
import crypto from "crypto";
// =============================================================================
// ADMIN HELPERS
// =============================================================================


// =============================================================================
// EXISTING ADMIN FUNCTIONS
// =============================================================================
export const getAdminStore = async () => {
  try {
    const user = await getCurrentUserId();

    if (!user) {
      return {
        success: false,
        message: "Unauthorized",
        status: 401,
      };
    }

    await dbConnect();

    const store = await User.aggregate([
      {
        $match: { _id: new mongoose.Types.ObjectId(user) },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          email: 1,
          phone: 1,
          addresses: 1,
          vendorProfile: 1,
          storeName: 1,
          storeDescription: 1,
          banner: 1,
          logo: 1,
          businessType: 1,
        },
      },
    ]);

    if (!store || store.length === 0) {
      return {
        success: false,
        message: "Store not found",
        status: 404,
      };
    }
    const storeCleanFormat = JSON.parse(JSON.stringify(store[0]));
    return {
      success: true,
      message: "Store found",
      status: 200,
      store: storeCleanFormat,
    };
  } catch (error) {
    console.log(error);
    return {
      success: false,
      message: "Internal server error",
      status: 500,
    };
  }
};

export const updateStore = async (storename: string, businessType: string) => {
  try {
    const user = await getCurrentUserId();

    if (!storename || !businessType) {
      return {
        success: false,
        message: "Store name and business type are required",
        status: 400,
      };
    }
    if (!user) {
      return {
        success: false,
        message: "Unauthorized",
        status: 401,
      };
    }
    await dbConnect();

    const store = await User.findByIdAndUpdate(
      user,
      {
        $set: {
          "vendorProfile.storeName": storename,
          "vendorProfile.businessType": businessType,
        },
      },
      {
        new: true, // Return the updated document
        runValidators: true, // Ensure schema validation
      }
    );
    const updatedStore = await User.findOne({
      _id: new mongoose.Types.ObjectId(user),
    });

    if (!store) {
      return {
        success: false,
        message: "Store not found",
        status: 404,
      };
    }
    return {
      success: true,
      message: "Store updated successfully. you can carry on.",
      status: 200,
    };
  } catch (error) {
    console.log(error);
    return {
      success: false,
      message: "Internal server error",
      status: 500,
    };
  }
};

export const updateAdminProfile = async (
  storename: string,
  businessType: string
) => {
  try {
    const user = await getCurrentUserId();

    if (!storename || !businessType) {
      return {
        success: false,
        message: "Store name and business type are required",
        status: 400,
      };
    }
    if (!user) {
      return {
        success: false,
        message: "Unauthorized",
        status: 401,
      };
    }
    await dbConnect();

    const store = await User.findByIdAndUpdate(
      user,
      {
        $set: {
          "vendorProfile.storeName": storename,
          "vendorProfile.businessType": businessType,
        },
      },
      {
        new: true, // Return the updated document
        runValidators: true, // Ensure schema validation
      }
    );
    const updatedStore = await User.findOne({
      _id: new mongoose.Types.ObjectId(user),
    });

    if (!store) {
      return {
        success: false,
        message: "Store not found",
        status: 404,
      };
    }
    return {
      success: true,
      message: "Store updated successfully. you can carry on.",
      status: 200,
    };
  } catch (error) {
    // Log error for debugging in development only
    if (process.env.NODE_ENV === 'development') {
      console.error('Admin action error:', error);
    }
    return { success: false, error: "Failed to perform admin action" };
  }
};

export const getStoreInfo = async () => {
  try {
    const user = await getCurrentUserId();

    if (!user) {
      return {
        success: false,
        message: "Unauthorized",
        status: 401,
      };
    }

    await dbConnect();

    const store = await User.aggregate([
      {
        $match: { _id: new mongoose.Types.ObjectId(user) },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          email: 1,
          phone: 1,
          addresses: 1,
          vendorProfile: 1,
          storeName: 1,
          storeDescription: 1,
          banner: 1,
          logo: 1,
          businessType: 1,
        },
      },
    ]);

    if (!store || store.length === 0) {
      return {
        success: false,
        message: "Store not found",
        status: 404,
      };
    }
    const storeCleanFormat = JSON.stringify(store[0]);
    return {
      success: true,
      message: "Store found",
      status: 200,
      store: storeCleanFormat,
    };
  } catch (error) {
    console.log(error);
    return {
      success: false,
      message: "Internal server error",
      status: 500,
    };
  }
};

export const updateStoreInfo = async (
  image?: File,
  description?: string,
  storename?: string,
  businessType?: string
) => {
  try {
    const formData = new FormData();
    if (image) {
      formData.append("file", image);
    }
    const res = await fetch(process.env.NEXT_PUBLIC_BASE_URL + "/api/upload", {
      method: "POST",
      body: formData,
    });
    const data = await res.json();

    const user = await getCurrentUserId();

    if (!user) {
      return {
        success: false,
        message: "Unauthorized",
        status: 401,
      };
    }

    await dbConnect();

    // Build the $set object conditionally
    const updateFields: any = {};

    if (storename) updateFields["vendorProfile.storeName"] = storename;
    if (businessType) updateFields["vendorProfile.businessType"] = businessType;
    if (description)
      updateFields["vendorProfile.storeDescription"] = description;
    if (image) updateFields["vendorProfile.logo"] = data.url;

    if (Object.keys(updateFields).length === 0) {
      return {
        success: false,
        message: "No data provided to update",
        status: 400,
      };
    }

    const store = await User.findByIdAndUpdate(
      user,
      { $set: updateFields },
      { new: true }
    );

    if (!store) {
      return {
        success: false,
        message: "Store not found",
        status: 404,
      };
    }

    return {
      success: true,
      message: "Store updated successfully.",
      status: 200,
    };
  } catch (error) {
    // Log error for debugging in development only
    if (process.env.NODE_ENV === 'development') {
      console.error('Admin action error:', error);
    }
    return { success: false, error: "Failed to perform admin action" };
  }
};
