export interface ICreditPackage {
  name: string;
  credit: number;
  price: number;
  priceDisplay?: number;
  pricePerCredit?: number;
  discountPercentage: number;
  isActive: boolean;
}
