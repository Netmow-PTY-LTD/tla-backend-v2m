import { Types } from 'mongoose';

export interface ITransaction {
  transactionId: string;
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

  // Tax fields for GST/VAT tracking
  taxAmount?: number;
  taxRate?: number;
  subtotal?: number;
  totalWithTax?: number;
  taxJurisdiction?: string;
  taxType?: string;
}
