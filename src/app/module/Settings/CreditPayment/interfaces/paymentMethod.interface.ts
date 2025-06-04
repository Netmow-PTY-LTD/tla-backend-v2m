import { Types } from 'mongoose';

export interface IPaymentMethod {
  userId: Types.ObjectId;
  cardLastFour: string;
  cardBrand: string;
  expiryMonth: number;
  expiryYear: number;
  isDefault: boolean;
  createdAt: Date;
}
