import mongoose from "mongoose"
import { config } from "dotenv"
import path from "path"

// Load environment variables from .env file
config({ path: path.resolve(process.cwd(), ".env.local") })

// Import models
import "../models/category"
import "../models/brand"
import "../models/product"
import "../models/user"

const Category = mongoose.model("Category")
const Brand = mongoose.model("Brand")
const Product = mongoose.model("Product")

// Sample data
const categories = [
  {
    name: "Traditional Wear",
    slug: "traditional-wear",
    description: "Authentic Nepali traditional clothing and accessories",
    image: "/images/categories/traditional-wear.jpg",
  },
  {
    name: "Handicrafts",
    slug: "handicrafts",
    description: "Handmade crafts showcasing Nepali artisanship",
    image: "/images/categories/handicrafts.jpg",
  },
  {
    name: "Jewelry",
    slug: "jewelry",
    description: "Traditional and modern Nepali jewelry pieces",
    image: "/images/categories/jewelry.jpg",
  },
  {
    name: "Home Decor",
    slug: "home-decor",
    description: "Authentic Nepali home decoration items",
    image: "/images/categories/home-decor.jpg",
  },
  {
    name: "Tea & Spices",
    slug: "tea-spices",
    description: "Premium Himalayan teas and authentic Nepali spices",
    image: "/images/categories/tea-spices.jpg",
  },
  {
    name: "Art & Paintings",
    slug: "art-paintings",
    description: "Traditional and contemporary Nepali art and paintings",
    image: "/images/categories/art-paintings.jpg",
  },
]

const brands = [
  {
    name: "Himalayan Crafts",
    slug: "himalayan-crafts",
    description: "Authentic crafts from the Himalayan region",
    logo: "/images/brands/himalayan-crafts.jpg",
  },
  {
    name: "Nepal Artisans",
    slug: "nepal-artisans",
    description: "Supporting local artisans across Nepal",
    logo: "/images/brands/nepal-artisans.jpg",
  },
  {
    name: "Kathmandu Textiles",
    slug: "kathmandu-textiles",
    description: "Premium textiles from the heart of Kathmandu",
    logo: "/images/brands/kathmandu-textiles.jpg",
  },
  {
    name: "Everest Goods",
    slug: "everest-goods",
    description: "Quality products inspired by Mount Everest",
    logo: "/images/brands/everest-goods.jpg",
  },
  {
    name: "Pokhara Handmade",
    slug: "pokhara-handmade",
    description: "Handmade products from the Pokhara region",
    logo: "/images/brands/pokhara-handmade.jpg",
  },
]

const products = [
  {
    name: "Nepali Traditional Dhaka Topi",
    slug: "nepali-traditional-dhaka-topi",
    description:
      "Authentic Nepali Dhaka Topi, handwoven with traditional patterns. This cultural headwear is perfect for festivals and special occasions.",
    price: 1200,
    images: ["/images/products/dhaka-topi-1.jpg", "/images/products/dhaka-topi-2.jpg"],
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
    images: ["/images/products/pashmina-1.jpg", "/images/products/pashmina-2.jpg"],
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
    images: ["/images/products/tea-set-1.jpg", "/images/products/tea-set-2.jpg"],
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
    images: ["/images/products/copper-vessel-1.jpg", "/images/products/copper-vessel-2.jpg"],
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
  {
    name: "Traditional Nepali Thangka Painting",
    slug: "traditional-nepali-thangka-painting",
    description:
      "Authentic Nepali Thangka painting, meticulously hand-painted by skilled artists. These traditional Buddhist artworks depict deities, mandalas, and other religious scenes.",
    price: 15000,
    images: ["/images/products/thangka-1.jpg", "/images/products/thangka-2.jpg"],
    stock: 10,
    rating: 4.9,
    reviews: 15,
    isNew: false,
    isFeatured: true,
    isOnSale: true,
    discount: 10,
    variants: {
      sizes: ["Small (30x40cm)", "Medium (50x70cm)", "Large (70x100cm)"],
    },
    features: [
      "Hand-painted by master artists",
      "Natural mineral and vegetable colors",
      "Traditional canvas preparation",
      "Intricate detailing and gold work",
      "Comes with silk brocade frame",
    ],
    specifications: {
      material: "Cotton canvas, natural pigments",
      dimensions: "Varies by size",
      origin: "Kathmandu Valley, Nepal",
      careInstructions: "Keep away from direct sunlight and moisture",
    },
  },
  {
    name: "Handmade Lokta Paper Notebook",
    slug: "handmade-lokta-paper-notebook",
    description:
      "Eco-friendly notebook made from traditional Nepali Lokta paper. Handcrafted by local artisans, these notebooks feature unique textures and designs.",
    price: 450,
    images: ["/images/products/lokta-notebook-1.jpg", "/images/products/lokta-notebook-2.jpg"],
    stock: 100,
    rating: 4.3,
    reviews: 27,
    isNew: false,
    isFeatured: true,
    isOnSale: false,
    discount: 0,
    variants: {
      colors: ["Natural", "Blue", "Red", "Green"],
      sizes: ["Small (A6)", "Medium (A5)", "Large (A4)"],
    },
    features: [
      "Handmade Lokta paper",
      "Eco-friendly and sustainable",
      "Acid-free and long-lasting",
      "Unique texture and appearance",
      "Supports local artisans",
    ],
    specifications: {
      material: "Lokta paper, handbound",
      pages: "80 blank pages",
      origin: "Nepal",
      dimensions: "Varies by size",
    },
  },
  {
    name: "Nepali Silver Filigree Earrings",
    slug: "nepali-silver-filigree-earrings",
    description:
      "Exquisite silver filigree earrings handcrafted by Nepali silversmiths. These delicate pieces showcase the intricate artistry of traditional Nepali jewelry making.",
    price: 1800,
    images: ["/images/products/silver-earrings-1.jpg", "/images/products/silver-earrings-2.jpg"],
    stock: 20,
    rating: 4.6,
    reviews: 19,
    isNew: true,
    isFeatured: false,
    isOnSale: false,
    discount: 0,
    variants: {
      designs: ["Mandala", "Peacock", "Lotus", "Traditional"],
    },
    features: [
      "925 Sterling Silver",
      "Handcrafted filigree work",
      "Traditional Nepali designs",
      "Lightweight and comfortable",
      "Comes in a gift box",
    ],
    specifications: {
      material: "925 Sterling Silver",
      weight: "Approximately 5g per pair",
      origin: "Patan, Nepal",
      careInstructions: "Clean with silver polish cloth",
    },
  },
  {
    name: "Hand-Carved Wooden Buddha Statue",
    slug: "hand-carved-wooden-buddha-statue",
    description:
      "Intricately hand-carved Buddha statue made from premium Nepali wood. Each piece is carefully crafted by skilled artisans, making it a unique spiritual art piece for your home.",
    price: 4500,
    images: ["/images/products/buddha-statue-1.jpg", "/images/products/buddha-statue-2.jpg"],
    stock: 15,
    rating: 4.8,
    reviews: 23,
    isNew: false,
    isFeatured: false,
    isOnSale: true,
    discount: 20,
    variants: {
      wood: ["Sal Wood", "Teak", "Sandalwood"],
      sizes: ["Small (15cm)", "Medium (30cm)", "Large (45cm)"],
    },
    features: [
      "Hand-carved by master craftsmen",
      "Premium quality wood",
      "Detailed facial expressions and features",
      "Traditional carving techniques",
      "Suitable for meditation spaces and home decor",
    ],
    specifications: {
      material: "Natural wood (varies by selection)",
      dimensions: "Varies by size",
      origin: "Nepal",
      careInstructions: "Dust regularly, keep away from excessive moisture",
    },
  },
]

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

// Seed data
async function seedData() {
  try {
    // Clear existing data
    await Category.deleteMany({})
    await Brand.deleteMany({})
    await Product.deleteMany({})

    console.log("Cleared existing data")

    // Insert categories
    const createdCategories = await Category.insertMany(categories)
    console.log(`Inserted ${createdCategories.length} categories`)

    // Insert brands
    const createdBrands = await Brand.insertMany(brands)
    console.log(`Inserted ${createdBrands.length} brands`)

    // Prepare products with references
    const preparedProducts = products.map((product) => {
      const categoryIndex = Math.floor(Math.random() * createdCategories.length)
      const brandIndex = Math.floor(Math.random() * createdBrands.length)

      return {
        ...product,
        category: createdCategories[categoryIndex]._id,
        brand: createdBrands[brandIndex]._id,
      }
    })

    // Insert products
    const createdProducts = await Product.insertMany(preparedProducts)
    console.log(`Inserted ${createdProducts.length} products`)

    // Update category product counts
    for (const category of createdCategories) {
      const count = await Product.countDocuments({ category: category._id })
      await Category.findByIdAndUpdate(category._id, { productCount: count })
    }
    console.log("Updated category product counts")

    console.log("Seeding completed successfully")
  } catch (error) {
    console.error("Error seeding data:", error)
  } finally {
    // Disconnect from MongoDB
    await mongoose.disconnect()
    console.log("Disconnected from MongoDB")
  }
}

// Run the seed function
connectDB().then(() => {
  seedData()
})
