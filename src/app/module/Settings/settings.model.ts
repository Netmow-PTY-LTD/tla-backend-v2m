import { Schema, model } from 'mongoose';
import { IAppSettings } from './settings.interface';

const settingsSchema = new Schema(
  {
    siteName: { type: String, default: 'The LawApp' },
    maintenanceMode: { type: Boolean, default: false },
    emailProviderEnabled: { type: Boolean, default: true },
    smsProviderEnabled: { type: Boolean, default: false },
    requireCreditsToRespond: { type: Boolean, default: true },
    allowCreditPurchase: { type: Boolean, default: true },
    responseLimitPerLead: { type: Number, default: 5 },
    stripeLiveMode: { type: Boolean, default: false },
    autoRefundIfLeadInactive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export const AppSettings = model<IAppSettings>('AppSettings', settingsSchema);

//   law firm certification type model  - it will be next time use dedicated module   just temporary stay here

const lawFirmCertificationSchema = new Schema(
  {
    countryId: { type: Schema.Types.ObjectId, ref: 'Country', required: true },
    type: {
      type: String,
      required: true,
      enum: ['mandatory', 'optional'],
    },
    certificationName: { type: String, required: true },
    logo: { type: String },
  },
  { timestamps: true },
);

// Model
export const LawFirmCertification = model(
  'LawFirmCertification',
  lawFirmCertificationSchema,
);
