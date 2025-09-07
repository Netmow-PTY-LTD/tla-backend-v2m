
import { Schema, model } from 'mongoose';
import { IAppSettings } from './settings.interface';

const settingsSchema = new Schema({
  siteName: { type: String, default: 'The LawApp' },
  maintenanceMode: { type: Boolean, default: false },
  emailProviderEnabled: { type: Boolean, default: true },
  smsProviderEnabled: { type: Boolean, default: false },
  requireCreditsToRespond: { type: Boolean, default: true },
  allowCreditPurchase: { type: Boolean, default: true },
  responseLimitPerLead: { type: Number, default: 5 },
  stripeLiveMode: { type: Boolean, default: false },
  autoRefundIfLeadInactive: { type: Boolean, default: true },
}, { timestamps: true });

export const AppSettings = model<IAppSettings>('AppSettings', settingsSchema);
