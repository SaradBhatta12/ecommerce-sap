import { NextRequest, NextResponse } from "next/server";
import Order from "@/models/order";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth/next";
import dbConnect from "@/lib/db-connect";

// GET - Get all orders
export async function GET() {
  try {
    const isAuthenticated = await getServerSession(authOptions as any);
    if (!isAuthenticated) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized user",
        },
        { status: 401 }
      );
    }

    await dbConnect();

    const orders = await Order.aggregate([
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $unwind: "$user",
      },
      {
        $project: {
          _id: 1,
          total: 1,
          status: 1,
          createdAt: 1,
          updatedAt: 1,
          paymentStatus: 1,
          "user._id": 1,
          "user.name": 1,
          "user.email": 1,
          "user.image": 1,
        },
      },
    ]);

    if (!orders) {
      return NextResponse.json(
        {
          success: false,
          message: "No orders found",
        },
        { status: 404 }
      );
    }

    const orderCleanFormat = JSON.stringify(orders);
    return NextResponse.json(
      {
        success: true,
        orders: orderCleanFormat,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}