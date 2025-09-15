import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../auth/[...nextauth]/route"
import dbConnect from "@/lib/db-connect"
import Category from "@/models/category"
import Product from "@/models/product"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    // Connect to database
    await dbConnect()

    // Find category by ID or slug
    const category = await Category.findOne({
      $or: [{ _id: id }, { slug: id }],
    })
      .populate("parent", "name slug")
      .lean()

    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 })
    }

    // Get product count
    const productCount = await Product.countDocuments({ category: category._id })
    category.productCount = productCount

    return NextResponse.json({ category })
  } catch (error) {
    console.error("Error fetching category:", error)
    return NextResponse.json({ error: "Failed to fetch category" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    // Check if user is admin
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const id = params.id
    const updateData = await request.json()

    // Connect to database
    await dbConnect()

    // Update category
    const category = await Category.findByIdAndUpdate(id, updateData, { new: true })

    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 })
    }

    return NextResponse.json({
      message: "Category updated successfully",
      category,
    })
  } catch (error) {
    console.error("Error updating category:", error)
    return NextResponse.json({ error: "Failed to update category" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    // Check if user is admin
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const id = params.id

    // Connect to database
    await dbConnect()

    // Check if category has products
    const productCount = await Product.countDocuments({ category: id })
    if (productCount > 0) {
      return NextResponse.json(
        {
          error: "Cannot delete category with products. Please reassign or delete the products first.",
        },
        { status: 400 },
      )
    }

    // Check if category has subcategories
    const subcategoryCount = await Category.countDocuments({ parent: id })
    if (subcategoryCount > 0) {
      return NextResponse.json(
        {
          error: "Cannot delete category with subcategories. Please reassign or delete the subcategories first.",
        },
        { status: 400 },
      )
    }

    // Delete category
    const category = await Category.findByIdAndDelete(id)

    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 })
    }

    return NextResponse.json({
      message: "Category deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting category:", error)
    return NextResponse.json({ error: "Failed to delete category" }, { status: 500 })
  }
}
