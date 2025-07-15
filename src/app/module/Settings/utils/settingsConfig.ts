

import { AppSettings } from "../models/settings.model";

let cache:any = null;
export const getAppSettings = async () => {
  if (cache) return cache;
  const settings = await AppSettings.findOne();
  cache = settings;
  return settings;
};
