

import { envConfigService } from "../EnvConfig/envConfig.service";
import { AppSettings } from "./settings.model";


export const getAppSettings = async () => {
  // if (cache) return cache;
  const settings = await AppSettings.findOne();
  if (settings) {
    const firmClientUrlConfig = await envConfigService.getConfigByKey('FIRM_CLIENT_URL');
    if (firmClientUrlConfig) {
      settings.firm_client_url = firmClientUrlConfig.value;
    }
  }
  // cache = settings;
  return settings;
};
