import { Schema, model } from 'mongoose';
import { IBillingTaxInfo } from './billing.interface';

//   model
const billingTaxSchema = new Schema<IBillingTaxInfo>(
  {
    // Firm details
    firmUser: { type: Schema.Types.ObjectId, ref: 'firmUser' },
    billingEmail: { type: String },
    iban: { type: String },
    bicSwift: { type: String },
    taxId: { type: String },
    currency: { type: String },
    notes: { type: String },
  },
  { timestamps: true },
);

export const BillingTaxInfo = model<IBillingTaxInfo>(
  'BillingTaxInfo',
  billingTaxSchema,
);
