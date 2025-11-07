export interface IAppSettings {
  siteName: string;
  favicon: string | null;
  appLogo: string | null;
  maintenanceMode: boolean;
  emailProviderEnabled: boolean;
  smsProviderEnabled: boolean;
  requireCreditsToRespond: boolean;
  allowCreditPurchase: boolean;
  responseLimitPerLead: number;
  stripeLiveMode: boolean;
  autoRefundIfLeadInactive: boolean;


}