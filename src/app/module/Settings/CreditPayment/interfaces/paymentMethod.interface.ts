import { Types } from 'mongoose';

export interface IPaymentMethod {
  userId: Types.ObjectId;
  stripeCustomerId: string;
  email: string;
  cardLastFour: string;
  cardBrand: string;
  expiryMonth: number;
  expiryYear: number;
  isDefault: boolean;
}
