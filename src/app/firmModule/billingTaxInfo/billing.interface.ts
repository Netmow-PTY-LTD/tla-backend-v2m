import { Document, Types } from 'mongoose';

export interface IBillingTaxInfo extends Document {
  // Firm details
  firmUser: Types.ObjectId;
  billingEmail: string;
  iban: string;
  bicSwift: string;
  taxId: string;
  currency: string;
  notes: string;
}
