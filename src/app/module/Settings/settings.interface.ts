export interface IAppSettings {
  siteName: string;
  favicon: string;
  appLogo: string;
  maintenanceMode: boolean;
  emailProviderEnabled: boolean;
  smsProviderEnabled: boolean;
  requireCreditsToRespond: boolean;
  allowCreditPurchase: boolean;
  responseLimitPerLead: number;
  stripeLiveMode: boolean;
  autoRefundIfLeadInactive: boolean;


}