import { NextResponse } from "next/server";

export async function POST(request: Request) {
  // Password reset functionality is currently disabled
  return NextResponse.json(
    {
      error: "Password reset is currently disabled. Please use Google Sign-In or contact the administrator for assistance.",
    },
    { status: 403 }
  );
}

export async function GET(request: Request) {
  // Password reset functionality is currently disabled
  return NextResponse.json(
    {
      error: "Password reset is currently disabled. Please use Google Sign-In or contact the administrator for assistance.",
    },
    { status: 403 }
  );
}
