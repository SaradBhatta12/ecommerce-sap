import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db-connect";
import Location from "@/models/locations";

// Helper function to build location tree
async function buildLocationTree() {
  const locations = await Location.find().sort({ name: 1 }).lean();
  
  // Create a map for quick lookup
  const locationMap = new Map();
  const rootLocations: any[] = [];
  
  // First pass: create map and identify root locations
  locations.forEach((location: any) => {
    location.children = [];
    locationMap.set(location._id.toString(), location);
    
    if (!location.parent) {
      rootLocations.push(location);
    }
  });
  
  // Second pass: build the tree structure
  locations.forEach((location: any) => {
    if (location.parent) {
      const parent = locationMap.get(location.parent.toString());
      if (parent) {
        parent.children.push(location);
      }
    }
  });
  
  return rootLocations;
}

// GET /api/locations/tree - Get hierarchical location tree (public access)
export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const locationTree = await buildLocationTree();

    return NextResponse.json(locationTree, { status: 200 });
  } catch (error) {
    console.error("Error fetching location tree:", error);
    return NextResponse.json(
      { error: "Failed to fetch location tree" },
      { status: 500 }
    );
  }
}