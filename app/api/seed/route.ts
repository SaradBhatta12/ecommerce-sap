import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../auth/[...nextauth]/route"
import dbConnect from "@/lib/db-connect"
import { getPlaceholderImage } from "@/lib/placeholder-images"

// Import models
import Category from "@/models/category"
import Brand from "@/models/brand"
import Product from "@/models/product"

// Sample data
const categories = [
  {
    name: "Traditional Wear",
    slug: "traditional-wear",
    description: "Authentic Nepali traditional clothing and accessories",
  },
  {
    name: "Handicrafts",
    slug: "handicrafts",
    description: "Handmade crafts showcasing Nepali artisanship",
  },
  {
    name: "Jewelry",
    slug: "jewelry",
    description: "Traditional and modern Nepali jewelry pieces",
  },
  {
    name: "Home Decor",
    slug: "home-decor",
    description: "Authentic Nepali home decoration items",
  },
  {
    name: "Tea & Spices",
    slug: "tea-spices",
    description: "Premium Himalayan teas and authentic Nepali spices",
  },
  {
    name: "Art & Paintings",
    slug: "art-paintings",
    description: "Traditional and contemporary Nepali art and paintings",
  },
]

const brands = [
  {
    name: "Himalayan Crafts",
    slug: "himalayan-crafts",
    description: "Authentic crafts from the Himalayan region",
  },
  {
    name: "Nepal Artisans",
    slug: "nepal-artisans",
    description: "Supporting local artisans across Nepal",
  },
  {
    name: "Kathmandu Textiles",
    slug: "kathmandu-textiles",
    description: "Premium textiles from the heart of Kathmandu",
  },
  {
    name: "Everest Goods",
    slug: "everest-goods",
    description: "Quality products inspired by Mount Everest",
  },
  {
    name: "Pokhara Handmade",
    slug: "pokhara-handmade",
    description: "Handmade products from the Pokhara region",
  },
]

const products = [
  {
    name: "Nepali Traditional Dhaka Topi",
    slug: "nepali-traditional-dhaka-topi",
    description:
      "Authentic Nepali Dhaka Topi, handwoven with traditional patterns. This cultural headwear is perfect for festivals and special occasions.",
    price: 1200,
    stock: 50,
    rating: 4.5,
    reviews: 24,
    isNew: true,
    isFeatured: true,
    isOnSale: false,
    discount: 0,
    variants: {
      colors: ["Black", "White", "Red"],
      sizes: ["S", "M", "L", "XL"],
    },
    features: [
      "Handwoven Dhaka fabric",
      "Traditional Nepali patterns",
      "Comfortable fit",
      "Suitable for festivals and ceremonies",
      "Made by skilled artisans",
    ],
    specifications: {
      material: "Cotton Dhaka Fabric",
      origin: "Nepal",
      careInstructions: "Hand wash with mild detergent",
    },
  },
  {
    name: "Handmade Nepali Pashmina Shawl",
    slug: "handmade-nepali-pashmina-shawl",
    description:
      "Luxurious Nepali Pashmina shawl, handwoven from the finest Himalayan mountain goat wool. Known for its exceptional softness and warmth.",
    price: 3500,
    stock: 35,
    rating: 5,
    reviews: 42,
    isNew: false,
    isFeatured: true,
    isOnSale: true,
    discount: 15,
    variants: {
      colors: ["Maroon", "Navy Blue", "Forest Green", "Beige", "Black"],
      sizes: ["Standard"],
    },
    features: [
      "100% authentic Pashmina wool",
      "Handwoven by skilled artisans",
      "Incredibly soft and warm",
      "Elegant traditional designs",
      "Perfect gift item",
    ],
    specifications: {
      material: "100% Pashmina Wool",
      dimensions: "200cm x 70cm",
      origin: "Nepal",
      careInstructions: "Dry clean only",
    },
  },
  {
    name: "Himalayan Herbal Tea Set",
    slug: "himalayan-herbal-tea-set",
    description:
      "A premium collection of organic herbal teas from the Himalayan region. This set includes a variety of flavors known for their health benefits and unique taste.",
    price: 850,
    stock: 60,
    rating: 4.2,
    reviews: 18,
    isNew: false,
    isFeatured: true,
    isOnSale: false,
    discount: 0,
    variants: {
      sizes: ["Small (5 varieties)", "Medium (10 varieties)", "Large (15 varieties)"],
    },
    features: [
      "100% organic herbs and tea leaves",
      "Sourced from high-altitude Himalayan regions",
      "No artificial flavors or preservatives",
      "Rich in antioxidants",
      "Variety of flavors including classic, spiced, and herbal blends",
    ],
    specifications: {
      contents: "Assorted tea bags and loose leaf teas",
      weight: "250g total",
      origin: "Himalayan region, Nepal",
      shelfLife: "18 months",
      storage: "Store in a cool, dry place",
    },
  },
  {
    name: "Nepali Handcrafted Copper Vessel",
    slug: "nepali-handcrafted-copper-vessel",
    description:
      "Traditional Nepali copper vessel, handcrafted by skilled artisans using ancient techniques. Perfect for serving water and other beverages with the health benefits of copper.",
    price: 2200,
    stock: 25,
    rating: 4.7,
    reviews: 31,
    isNew: true,
    isFeatured: true,
    isOnSale: false,
    discount: 0,
    variants: {
      sizes: ["Small (500ml)", "Medium (1L)", "Large (1.5L)"],
    },
    features: [
      "100% pure copper",
      "Handcrafted with traditional techniques",
      "Intricate engravings and designs",
      "Health benefits of storing water in copper",
      "Leak-proof and durable",
    ],
    specifications: {
      material: "Pure Copper",
      dimensions: "Varies by size",
      origin: "Lalitpur, Nepal",
      careInstructions: "Clean with lemon and salt solution, avoid harsh detergents",
    },
  },
]

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    // Check if user is admin
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Connect to database
    await dbConnect()

    // Clear existing data
    await Category.deleteMany({})
    await Brand.deleteMany({})
    await Product.deleteMany({})

    // Insert categories with placeholder images
    const createdCategories = await Promise.all(
      categories.map(async (category) => {
        const image = getPlaceholderImage("category", category.slug)
        return await Category.create({ ...category, image })
      }),
    )

    // Insert brands with placeholder images
    const createdBrands = await Promise.all(
      brands.map(async (brand) => {
        const logo = getPlaceholderImage("brand", brand.slug)
        return await Brand.create({ ...brand, logo })
      }),
    )

    // Prepare products with references and placeholder images
    const createdProducts = await Promise.all(
      products.map(async (product) => {
        const categoryIndex = Math.floor(Math.random() * createdCategories.length)
        const brandIndex = Math.floor(Math.random() * createdBrands.length)
        const images = [
          getPlaceholderImage("product", product.slug, 0),
          getPlaceholderImage("product", product.slug, 1),
        ]

        return await Product.create({
          ...product,
          images,
          category: createdCategories[categoryIndex]._id,
          brand: createdBrands[brandIndex]._id,
        })
      }),
    )

    // Update category product counts
    for (const category of createdCategories) {
      const count = await Product.countDocuments({ category: category._id })
      await Category.findByIdAndUpdate(category._id, { productCount: count })
    }

    return NextResponse.json({
      message: "Seed data created successfully",
      categories: createdCategories.length,
      brands: createdBrands.length,
      products: createdProducts.length,
    })
  } catch (error) {
    console.error("Error seeding data:", error)
    return NextResponse.json({ error: "Failed to seed data" }, { status: 500 })
  }
}
