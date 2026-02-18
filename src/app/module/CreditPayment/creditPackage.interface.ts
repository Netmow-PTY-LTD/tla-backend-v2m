import mongoose from "mongoose";

export interface ICreditPackage {
  name: string;
  credit: number;
  price: number;
  priceDisplay?: number;
  pricePerCredit?: number;
  discountPercentage: number;
  isActive: boolean;
  currency?: string; // Auto-populated from country, optional during creation
  country: mongoose.Types.ObjectId;
}
