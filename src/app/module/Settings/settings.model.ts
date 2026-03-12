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
    emailSettings: {
      isFlowEnabled: { type: Boolean, default: true },
      maxRetries: { type: Number, default: 3 },
      workerConcurrency: { type: Number, default: 5 },
      batchSize: { type: Number, default: 50 }
    },
    robots: { type: String, default: 'noindex, nofollow' },
    firm_client_url: { type: String, default: '' },
  },
  { timestamps: true },
);

export const AppSettings = model<IAppSettings>('AppSettings', settingsSchema);

