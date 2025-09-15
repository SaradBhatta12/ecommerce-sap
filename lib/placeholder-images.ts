// This file provides placeholder image URLs for development
// In production, you would replace these with actual image URLs

export const placeholderImages = {
  categories: {
    "traditional-wear": "/placeholder.svg?height=200&width=200&text=Traditional+Wear",
    handicrafts: "/placeholder.svg?height=200&width=200&text=Handicrafts",
    jewelry: "/placeholder.svg?height=200&width=200&text=Jewelry",
    "home-decor": "/placeholder.svg?height=200&width=200&text=Home+Decor",
    "tea-spices": "/placeholder.svg?height=200&width=200&text=Tea+and+Spices",
    "art-paintings": "/placeholder.svg?height=200&width=200&text=Art+and+Paintings",
  },
  brands: {
    "himalayan-crafts": "/placeholder.svg?height=200&width=200&text=Himalayan+Crafts",
    "nepal-artisans": "/placeholder.svg?height=200&width=200&text=Nepal+Artisans",
    "kathmandu-textiles": "/placeholder.svg?height=200&width=200&text=Kathmandu+Textiles",
    "everest-goods": "/placeholder.svg?height=200&width=200&text=Everest+Goods",
    "pokhara-handmade": "/placeholder.svg?height=200&width=200&text=Pokhara+Handmade",
  },
  products: {
    "dhaka-topi": [
      "/placeholder.svg?height=600&width=600&text=Dhaka+Topi+1",
      "/placeholder.svg?height=600&width=600&text=Dhaka+Topi+2",
    ],
    pashmina: [
      "/placeholder.svg?height=600&width=600&text=Pashmina+1",
      "/placeholder.svg?height=600&width=600&text=Pashmina+2",
    ],
    "tea-set": [
      "/placeholder.svg?height=600&width=600&text=Tea+Set+1",
      "/placeholder.svg?height=600&width=600&text=Tea+Set+2",
    ],
    "copper-vessel": [
      "/placeholder.svg?height=600&width=600&text=Copper+Vessel+1",
      "/placeholder.svg?height=600&width=600&text=Copper+Vessel+2",
    ],
    thangka: [
      "/placeholder.svg?height=600&width=600&text=Thangka+1",
      "/placeholder.svg?height=600&width=600&text=Thangka+2",
    ],
    "lokta-notebook": [
      "/placeholder.svg?height=600&width=600&text=Lokta+Notebook+1",
      "/placeholder.svg?height=600&width=600&text=Lokta+Notebook+2",
    ],
    "silver-earrings": [
      "/placeholder.svg?height=600&width=600&text=Silver+Earrings+1",
      "/placeholder.svg?height=600&width=600&text=Silver+Earrings+2",
    ],
    "buddha-statue": [
      "/placeholder.svg?height=600&width=600&text=Buddha+Statue+1",
      "/placeholder.svg?height=600&width=600&text=Buddha+Statue+2",
    ],
  },
}

export function getPlaceholderImage(type: "category" | "brand" | "product", slug: string, index = 0): string {
  if (type === "category" && slug in placeholderImages.categories) {
    return placeholderImages.categories[slug as keyof typeof placeholderImages.categories]
  }

  if (type === "brand" && slug in placeholderImages.brands) {
    return placeholderImages.brands[slug as keyof typeof placeholderImages.brands]
  }

  if (type === "product") {
    // Try to find a matching product key
    const productKey = Object.keys(placeholderImages.products).find((key) => slug.includes(key))
    if (productKey) {
      const images = placeholderImages.products[productKey as keyof typeof placeholderImages.products]
      return images[index % images.length]
    }
  }

  // Default fallback
  return `/placeholder.svg?height=600&width=600&text=${slug.replace(/-/g, "+")}`
}
