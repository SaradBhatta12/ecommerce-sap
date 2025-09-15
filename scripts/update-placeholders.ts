import mongoose from "mongoose"
import { config } from "dotenv"
import path from "path"
import { getPlaceholderImage } from "../lib/placeholder-images"

// Load environment variables from .env file
config({ path: path.resolve(process.cwd(), ".env.local") })

// Import models
import "../models/category"
import "../models/brand"
import "../models/product"

const Category = mongoose.model("Category")
const Brand = mongoose.model("Brand")
const Product = mongoose.model("Product")

// Connect to MongoDB
async function connectDB() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is not defined in environment variables")
    }

    await mongoose.connect(process.env.MONGODB_URI)
    console.log("Connected to MongoDB")
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error)
    process.exit(1)
  }
}

// Update placeholder images
async function updatePlaceholders() {
  try {
    // Update categories
    const categories = await Category.find({})
    for (const category of categories) {
      const placeholderImage = getPlaceholderImage("category", category.slug)
      await Category.findByIdAndUpdate(category._id, { image: placeholderImage })
    }
    console.log(`Updated ${categories.length} categories with placeholder images`)

    // Update brands
    const brands = await Brand.find({})
    for (const brand of brands) {
      const placeholderImage = getPlaceholderImage("brand", brand.slug)
      await Brand.findByIdAndUpdate(brand._id, { logo: placeholderImage })
    }
    console.log(`Updated ${brands.length} brands with placeholder images`)

    // Update products
    const products = await Product.find({})
    for (const product of products) {
      const images = [getPlaceholderImage("product", product.slug, 0), getPlaceholderImage("product", product.slug, 1)]
      await Product.findByIdAndUpdate(product._id, { images })
    }
    console.log(`Updated ${products.length} products with placeholder images`)

    console.log("Placeholder update completed successfully")
  } catch (error) {
    console.error("Error updating placeholders:", error)
  } finally {
    // Disconnect from MongoDB
    await mongoose.disconnect()
    console.log("Disconnected from MongoDB")
  }
}

// Run the update function
connectDB().then(() => {
  updatePlaceholders()
})
