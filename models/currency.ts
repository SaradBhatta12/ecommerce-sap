import mongoose, { Document, Schema } from 'mongoose';

export interface ICurrency extends Document {
  name: string;
  code: string;
  symbol: string;
  exchangeRate: number;
  isActive: boolean;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CurrencySchema = new Schema<ICurrency>({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true,
    minlength: 3,
    maxlength: 3,
  },
  symbol: {
    type: String,
    required: true,
    trim: true,
  },
  exchangeRate: {
    type: Number,
    required: true,
    min: 0,
    default: 1,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  isDefault: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

// Ensure only one default currency
CurrencySchema.pre('save', async function(next) {
  if (this.isDefault) {
    await mongoose.model('Currency').updateMany(
      { _id: { $ne: this._id } },
      { isDefault: false }
    );
  }
  next();
});

const Currency = mongoose.models.Currency || mongoose.model<ICurrency>('Currency', CurrencySchema);

export default Currency;