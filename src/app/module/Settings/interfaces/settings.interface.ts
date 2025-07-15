export interface IAppSettings {
  siteName: string;
  maintenanceMode: boolean;
  emailProviderEnabled: boolean;
  smsProviderEnabled: boolean;
  requireCreditsToRespond: boolean;
  allowCreditPurchase: boolean;
  responseLimitPerLead: number;
  stripeLiveMode: boolean;
  autoRefundIfLeadInactive: boolean;
  
}