import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/auth-utils";
import user from "@/models/user";
import dbConnect from "@/lib/db-connect";

// GET - Get payment details (eSewa and Khalti)
export async function GET() {
  try {
    const currentUserId = await getCurrentUserId();
    
    if (!currentUserId) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
        },
        { status: 401 }
      );
    }

    await dbConnect();

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
      return NextResponse.json(
        {
          success: false,
          error: "No payment details found for eSewa",
        },
        { status: 404 }
      );
    }

    const esewaDetails = esewAndKhalti[0].esewa;
    if (!esewaDetails) {
      return NextResponse.json(
        {
          success: false,
          error: "eSewa payment details not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
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
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error fetching eSewa payment details:", error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Failed to fetch eSewa payment details",
      },
      { status: 500 }
    );
  }
}

// PUT - Update payment details (eSewa)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { merchantId, secretKey, callbackUrl, paymentUrl } = body;

    if (!merchantId || !secretKey || !callbackUrl || !paymentUrl) {
      return NextResponse.json(
        {
          success: false,
          error: "All eSewa payment details are required",
        },
        { status: 400 }
      );
    }

    const currentUserId = await getCurrentUserId();
    
    if (!currentUserId) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
        },
        { status: 401 }
      );
    }

    await dbConnect();

    const updatedUser = await user.findByIdAndUpdate(
      currentUserId,
      {
        $set: {
          "esewa.merchantId": merchantId,
          "esewa.secretKey": secretKey,
          "esewa.callbackUrl": callbackUrl,
          "esewa.paymentUrl": paymentUrl,
        },
      },
      { new: true }
    );

    if (!updatedUser) {
      return NextResponse.json(
        {
          success: false,
          error: "Failed to update payment details",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Payment details updated successfully",
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error updating payment details:", error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Failed to update payment details",
      },
      { status: 500 }
    );
  }
}