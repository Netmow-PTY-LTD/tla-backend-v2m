export interface ICreditPackage {
  name: string;
  creditAmount: number;
  price: number;
  priceDisplay?: string;
  pricePerCredit?: string;
  discountPercentage: number;
  isActive: boolean;
}
