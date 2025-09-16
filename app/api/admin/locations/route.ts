import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db-connect";
import Location from "@/models/locations";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// GET /api/admin/locations - Get all locations (for admin)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin (you may need to adjust this based on your user model)
    // For now, assuming all authenticated users can access admin endpoints
    // You should add proper admin role checking here

    await dbConnect();

    const locations = await Location.find().sort({ path: 1 }).lean();

    return NextResponse.json({ locations }, { status: 200 });
  } catch (error) {
    console.error("Error fetching locations:", error);
    return NextResponse.json(
      { error: "Failed to fetch locations" },
      { status: 500 }
    );
  }
}

// POST /api/admin/locations - Create new location
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const body = await request.json();
    const { name, type, parent, shippingPrice } = body;

    // Validate required fields
    if (!name || !type) {
      return NextResponse.json(
        { error: "Name and type are required" },
        { status: 400 }
      );
    }

    // Validate type
    if (!['country', 'province', 'city', 'landmark'].includes(type)) {
      return NextResponse.json(
        { error: "Invalid location type" },
        { status: 400 }
      );
    }

    // If parent is provided, validate it exists
    if (parent) {
      const parentLocation = await Location.findById(parent);
      if (!parentLocation) {
        return NextResponse.json(
          { error: "Parent location not found" },
          { status: 400 }
        );
      }
    }

    // Create new location
    const locationData: any = {
      name: name.trim(),
      type,
      parent: parent || null,
      admin: session.user.id,
    };

    // Add shipping price for landmarks
    if (type === 'landmark' && shippingPrice !== undefined) {
      locationData.shippingPrice = Number(shippingPrice);
    }

    const location = new Location(locationData);
    await location.save();

    return NextResponse.json(
      {
        message: "Location created successfully",
        locationId: location._id,
        location,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating location:", error);
    return NextResponse.json(
      { error: "Failed to create location" },
      { status: 500 }
    );
  }
}