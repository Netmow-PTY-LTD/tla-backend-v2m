

import { IAppSettings } from "./settings.interface";
import { AppSettings } from "./settings.model";


 const getSettings = async () => {
  let settings = await AppSettings.findOne();
  if (!settings) {
    settings = await AppSettings.create({});
  }
  return settings;
};

 const updateSettings = async (updates: Partial<IAppSettings>) => {
  const settings = await getSettings();
  Object.assign(settings, updates);
  return settings.save();
};

 const resetSettings = async () => {
  await AppSettings.deleteMany({});
  return AppSettings.create({});
};


export  const settingsService={
getSettings,
updateSettings,
resetSettings
}