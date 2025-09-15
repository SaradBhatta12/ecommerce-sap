import mongoose, { Document, Model, Schema } from "mongoose";

interface ILocation extends Document {
  name: string;
  type: "country" | "province" | "city" | "landmark";
  parent?: mongoose.Types.ObjectId | null;
  shippingPrice?: number;
  path?: string;
  admin?: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
}

const locationSchema = new Schema<ILocation>({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  type: {
    type: String,
    required: true,
    enum: ["country", "province", "city", "landmark"],
  },
  parent: {
    type: Schema.Types.ObjectId,
    ref: "Location",
    default: null,
  },
  shippingPrice: {
    type: Number,
    min: 0,
    default: 0,
  },
  path: {
    type: String,
    index: true,
  },
  admin: {
    type: Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },
  updatedBy: {
    type: Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },
});

locationSchema.pre<ILocation>("save", async function (next) {
  if (this.parent) {
    const parent = (await this.model("Location").findById(
      this.parent
    )) as ILocation | null;
    this.path = parent ? `${parent.path}/${this.name}` : this.name;
  } else {
    this.path = this.name;
  }
  next();
});

// Pre-deleteOne hook to delete child locations recursively
locationSchema.pre<ILocation>(
  "deleteOne",
  { document: true },
  async function (next) {
    const children = await this.model("Location").find({ parent: this._id });
    for (const child of children) {
      await child.deleteOne();
    }
    next();
  }
);

const Location: Model<ILocation> =
  mongoose.models.Location ||
  mongoose.model<ILocation>("Location", locationSchema);

export default Location;
