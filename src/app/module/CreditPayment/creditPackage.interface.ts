import mongoose from "mongoose";

export interface ICreditPackage {
  name: string;
  credit: number;
  price: number;
  priceDisplay?: number;
  pricePerCredit?: number;
  discountPercentage: number;
  isActive: boolean;
  currency: string;
  country: mongoose.Types.ObjectId;
}
