export interface ICoupon {
  code: string;
  discountPercentage: number;
  validFrom: Date;
  validTo: Date;
  maxUses?: number;
  currentUses: number;
  isActive: boolean;
}
