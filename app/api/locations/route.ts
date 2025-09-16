import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db-connect";
import Location from "@/models/locations";

// GET /api/locations - Get locations with optional filtering
export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const parent = searchParams.get('parent');
    const search = searchParams.get('search');

    let query: any = {};

    // Filter by type if provided
    if (type) {
      query.type = type;
    }

    // Filter by parent if provided
    if (parent) {
      query.parent = parent;
    } else if (parent === 'null' || parent === '') {
      query.parent = null;
    }

    // Search by name if provided
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    const locations = await Location.find(query)
      .populate('parent', 'name type')
      .sort({ name: 1 })
      .lean();

    return NextResponse.json({ locations }, { status: 200 });
  } catch (error) {
    console.error("Error fetching locations:", error);
    return NextResponse.json(
      { error: "Failed to fetch locations" },
      { status: 500 }
    );
  }
}