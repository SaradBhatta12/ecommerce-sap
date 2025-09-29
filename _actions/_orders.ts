"use server";
import Order from "@/models/order";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth/next";
export const getOrDerById = async (id: string) => {
  try {
    const isAuthenticated = await getServerSession(authOptions);
    if (!isAuthenticated) {
      return {
        succes: false,
        message: "Unauthorized",
        status: 401,
      };
    }
    const order = await Order.findById(id);
    // const OrderPlaneFormat = JSON.stringify(order);
    return {
      succes: true,
      order,
      status: 200,
    };
  } catch (error) {
    console.error("Error fetching order:", error);
    return {
      succes: false,
      message: "Internal server error",
      status: 500,
    };
  }
};

export const getAllOrders = async (
  page: number = 1,
  limit: number = 10,
  status?: string,
  payment?: string,
  dateFrom?: string,
  dateTo?: string,
  searchQuery?: string,
) => {
  try {
    const skip = (page - 1) * limit;
    const totalOrders = await Order.countDocuments();
    const totalPages = Math.ceil(totalOrders / limit);
    if (page > totalPages) {
      return {
        succes: false,
        message: "Page not found",
        status: 404,
      };
    }
    const isAuthenticated = await getServerSession(authOptions);
    if (!isAuthenticated) {
      return {
        succes: false,
        message: "Unauthorized user",
        status: 401,
      };
    }
    let query: any = {};
    if (status && status !== "all") {
      query.status = status;
    }
    if (payment && payment !== "all") {
      query.paymentStatus = payment;
    }
    if (dateFrom && dateTo) {
      query.createdAt = {
        $gte: new Date(dateFrom),
        $lte: new Date(dateTo),
      };
    }
    if (searchQuery) {
      query.$or = [
        { "user.name": { $regex: searchQuery, $options: "i" } },
        { "user.email": { $regex: searchQuery, $options: "i" } },
      ];
    }
    const orders = await Order.aggregate([
      {
        $match: query,
      },
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
      {
        $sort: {
          createdAt: -1,
        },
      },
      {
        $skip: skip,
      },
      {
        $limit: limit,
      },
    ]);
    if (!orders) {
      return {
        succes: false,
        message: "No orders found",
        status: 404,
      };
    }
    const orderCleanFormat = JSON.stringify(orders);
    return {
      succes: true,
      orders: orderCleanFormat,
      totalOrders,
      totalPages,
      status: 200,
    };
  } catch (error) {
    console.error("Error fetching orders:", error);
    return {
      succes: false,
      message: "Internal server error",
      status: 500,
    };
  }
};
