"use server";

import { getCurrentUserId } from "@/lib/auth-utils";
import user from "@/models/user";

export const getPaymentDetails = async () => {
  try {
    const currentUserId = await getCurrentUserId();
    const esewAndKhalti = await user.aggregate([
      {
        $match: { _id: currentUserId },
      },
      {
        $project: {
          esewa: 1,
          khalti: 1,
        },
      },
    ]);
    if (!esewAndKhalti || esewAndKhalti.length === 0) {
      return {
        success: false,
        error: "No payment details found for eSewa",
      };
    }
    const esewaDetails = esewAndKhalti[0].esewa;
    if (!esewaDetails) {
      return {
        success: false,
        error: "eSewa payment details not found",
      };
    }
    return {
      success: true,
      esewa: {
        merchantId: esewaDetails.merchantId,
        secretKey: esewaDetails.secretKey,
        callbackUrl: esewaDetails.callbackUrl,
        paymentUrl: esewaDetails.paymentUrl,
      },
      khalti: {
        publicKey: esewAndKhalti[0].khalti?.publicKey,
        secretKey: esewAndKhalti[0].khalti?.secretKey,
        returnUrl: esewAndKhalti[0].khalti?.returnUrl,
        callbackUrl: esewAndKhalti[0].khalti?.callbackUrl,
      },
      message: "eSewa payment details fetched successfully",
    };
  } catch (error: any) {
    console.error("Error fetching eSewa payment details:", error);
    return {
      success: false,
      error: error?.message || "Failed to fetch eSewa payment details",
    };
  }
};

export const updatePaymentDetails = async (esewaDetails: {
  merchantId: string;
  secretKey: string;
  callbackUrl: string;
  paymentUrl: string;
}) => {
  try {
    const currentUserId = await getCurrentUserId();
    const updatedUser = await user.findByIdAndUpdate(
      currentUserId,
      {
        $set: {
          "esewa.merchantId": esewaDetails.merchantId,
          "esewa.secretKey": esewaDetails.secretKey,
          "esewa.callbackUrl": esewaDetails.callbackUrl,
          "esewa.paymentUrl": esewaDetails.paymentUrl,
        },
      },
      { new: true }
    );

    if (!updatedUser) {
      return {
        success: false,
        error: "Failed to update payment details",
      };
    }

    return {
      success: true,
      message: "Payment details updated successfully",
    };
  } catch (error: any) {
    console.error("Error updating payment details:", error);
    return {
      success: false,
      error: error?.message || "Failed to update payment details",
    };
  }
};
