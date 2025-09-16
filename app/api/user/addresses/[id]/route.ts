import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../../auth/[...nextauth]/route"
import dbConnect from "@/lib/db-connect"
import User from "@/models/user"
import mongoose from "mongoose"

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id: addressId } = await params
    const addressData = await request.json()

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(addressId)) {
      return NextResponse.json({ error: "Invalid address ID" }, { status: 400 })
    }

    // Enhanced validation for update data
    if (addressData.fullName !== undefined && !addressData.fullName?.trim()) {
      return NextResponse.json({ error: "Full name cannot be empty" }, { status: 400 })
    }

    if (addressData.phone !== undefined && !addressData.phone?.trim()) {
      return NextResponse.json({ error: "Phone number cannot be empty" }, { status: 400 })
    }

    // Validate phone number format if provided
    const phoneRegex = /^(9[678]\d{8})$/;
    if (addressData.phone && !phoneRegex.test(addressData.phone)) {
      return NextResponse.json(
        { error: "Please enter a valid Nepali phone number (98xxxxxxxx)" },
        { status: 400 }
      );
    }

    // Validate alternate phone if provided
    if (addressData.alternatePhone && !phoneRegex.test(addressData.alternatePhone)) {
      return NextResponse.json(
        { error: "Please enter a valid alternate phone number (98xxxxxxxx)" },
        { status: 400 }
      );
    }

    // Validate postal code if provided
    if (addressData.postalCode && !/^\d{5}$/.test(addressData.postalCode)) {
      return NextResponse.json(
        { error: "Postal code must be 5 digits" },
        { status: 400 }
      );
    }

    // Validate address type if provided
    if (addressData.addressType && !['home', 'office', 'other'].includes(addressData.addressType)) {
      return NextResponse.json(
        { error: "Address type must be home, office, or other" },
        { status: 400 }
      );
    }

    // Validate coordinates if provided
    if (addressData.coordinates) {
      const { lat, lng } = addressData.coordinates;
      if (lat !== undefined && (lat < -90 || lat > 90)) {
        return NextResponse.json(
          { error: "Latitude must be between -90 and 90" },
          { status: 400 }
        );
      }
      if (lng !== undefined && (lng < -180 || lng > 180)) {
        return NextResponse.json(
          { error: "Longitude must be between -180 and 180" },
          { status: 400 }
        );
      }
    }

    // Connect to database
    await dbConnect()

    // Get user
    const user = await User.findById(session.user.id)

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Find address index
    const addressIndex = user.addresses.findIndex((addr: any) => addr._id.toString() === addressId)

    if (addressIndex === -1) {
      return NextResponse.json({ error: "Address not found" }, { status: 404 })
    }

    // If setting as default, update all other addresses
    if (addressData.isDefault) {
      user.addresses.forEach((address: any) => {
        address.isDefault = false
      })
    }

    // Prepare updated address data with trimmed strings
    const updatedData = { ...addressData };
    if (updatedData.fullName) updatedData.fullName = updatedData.fullName.trim();
    if (updatedData.phone) updatedData.phone = updatedData.phone.trim();
    if (updatedData.alternatePhone) updatedData.alternatePhone = updatedData.alternatePhone.trim();
    if (updatedData.city) updatedData.city = updatedData.city.trim();
    if (updatedData.district) updatedData.district = updatedData.district.trim();
    if (updatedData.province) updatedData.province = updatedData.province.trim();
    if (updatedData.locality) updatedData.locality = updatedData.locality.trim();
    if (updatedData.postalCode) updatedData.postalCode = updatedData.postalCode.trim();
    if (updatedData.landmark) updatedData.landmark = updatedData.landmark.trim();
    if (updatedData.deliveryInstructions) updatedData.deliveryInstructions = updatedData.deliveryInstructions.trim();

    // Build full address string if location fields are updated
    const currentAddress = user.addresses[addressIndex];
    const locality = updatedData.locality !== undefined ? updatedData.locality : currentAddress.locality;
    const district = updatedData.district !== undefined ? updatedData.district : currentAddress.district;
    const city = updatedData.city !== undefined ? updatedData.city : currentAddress.city;
    const province = updatedData.province !== undefined ? updatedData.province : currentAddress.province;
    const postalCode = updatedData.postalCode !== undefined ? updatedData.postalCode : currentAddress.postalCode;

    const addressParts = [locality, district || city, province, postalCode].filter(Boolean);
    if (addressParts.length > 0) {
      updatedData.address = addressParts.join(", ");
    }

    // Update address with new data
    user.addresses[addressIndex] = { 
      ...user.addresses[addressIndex].toObject(), 
      ...updatedData,
      updatedAt: new Date()
    }

    // Mark as modified and save
    user.markModified("addresses");
    await user.save()

    return NextResponse.json({
      message: "Address updated successfully",
      address: user.addresses[addressIndex],
      addresses: user.addresses,
    })
  } catch (error: any) {
    console.error("Error updating address:", error)
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map((err: any) => err.message);
      return NextResponse.json(
        { error: "Validation failed", details: validationErrors },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: "Failed to update address" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id: addressId } = await params

    // Connect to database
    await dbConnect()

    // Get user
    const user = await User.findById(session.user.id)

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Find address index
    const addressIndex = user.addresses.findIndex((addr) => addr._id.toString() === addressId)

    if (addressIndex === -1) {
      return NextResponse.json({ error: "Address not found" }, { status: 404 })
    }

    // Check if it's the default address
    const isDefault = user.addresses[addressIndex].isDefault

    // Remove address
    user.addresses.splice(addressIndex, 1)

    // If it was the default address and there are other addresses, set the first one as default
    if (isDefault && user.addresses.length > 0) {
      user.addresses[0].isDefault = true
    }

    // Save user
    await user.save()

    return NextResponse.json({
      message: "Address deleted successfully",
      addresses: user.addresses,
    })
  } catch (error) {
    console.error("Error deleting address:", error)
    return NextResponse.json({ error: "Failed to delete address" }, { status: 500 })
  }
}
