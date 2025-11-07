import { Schema, model } from 'mongoose';
import { IAppSettings } from './settings.interface';

const settingsSchema = new Schema(
  {
    siteName: { type: String, default: 'The LawApp' },
    appLogo: { type: String, default: '' },
    favicon: { type: String, default: '' },
    maintenanceMode: { type: Boolean, default: false },
    emailProviderEnabled: { type: Boolean, default: true },
    smsProviderEnabled: { type: Boolean, default: false },
    requireCreditsToRespond: { type: Boolean, default: true },
    allowCreditPurchase: { type: Boolean, default: true },
    responseLimitPerLead: { type: Number, default: 5 },
    stripeLiveMode: { type: Boolean, default: false },
    autoRefundIfLeadInactive: { type: Boolean, default: true },
    robots: { type: String, default: 'noindex, nofollow' },
  },
  { timestamps: true },
);

export const AppSettings = model<IAppSettings>('AppSettings', settingsSchema);

