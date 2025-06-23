import { Types } from 'mongoose';

export interface ITransaction {
  userId: Types.ObjectId;
  type: 'purchase' | 'refund' | 'usage';
  creditPackageId?: Types.ObjectId;
  credit: number;
  amountPaid?: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed';
  invoiceId?: string;
  couponCode?: string;
  discountApplied: number;
  createdAt: Date;
}
