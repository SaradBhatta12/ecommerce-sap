import mongoose from "mongoose"

const WishlistSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
  },
  { timestamps: true },
)

// Create a compound index to ensure a user can only add a product once
WishlistSchema.index({ user: 1, product: 1 }, { unique: true })

export default mongoose.models.Wishlist || mongoose.model("Wishlist", WishlistSchema)
