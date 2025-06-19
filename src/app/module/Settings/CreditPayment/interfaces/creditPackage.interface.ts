export interface ICreditPackage {
  name: string;
  credit: number;
  price: number;
  priceDisplay?: string;
  pricePerCredit?: string;
  discountPercentage: number;
  isActive: boolean;
}
