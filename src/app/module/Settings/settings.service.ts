

import mongoose from "mongoose";
import { deleteFromSpace, uploadToSpaces } from "../../config/upload";
import { FOLDERS } from "../../constant";
import { IAppSettings } from "./settings.interface";
import { AppSettings } from "./settings.model";


const getSettings = async () => {
  let settings = await AppSettings.findOne();
  if (!settings) {
    settings = await AppSettings.create({});
  }
  return settings;
};


export const updateSettings = async (
  updates: Partial<IAppSettings>,
  files?: Record<string, Express.Multer.File[]>
) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  const currentSettings = await settingsService.getSettings();
  try {

    // ===== APP LOGO =====
    if (files?.appLogo?.[0]) {
      const file = files.appLogo[0];
      const newLogoUrl = await uploadToSpaces(file.buffer, file.originalname, {
        folder: FOLDERS.APP_SETTINGS,
        customFileName: 'app-logo',
      });
      updates.appLogo = newLogoUrl;

      if (currentSettings.appLogo) {
        await deleteFromSpace(currentSettings.appLogo).catch(console.error);
      }
    } else if (updates.appLogo === '' || updates.appLogo === 'null') {
      if (currentSettings.appLogo) {
        await deleteFromSpace(currentSettings.appLogo).catch(console.error);
      }
      updates.appLogo = null;
    } else {
      updates.appLogo = currentSettings.appLogo;
    }

    // ===== FAVICON =====
    if (files?.favicon?.[0]) {
      const file = files.favicon[0];
      const newFaviconUrl = await uploadToSpaces(file.buffer, file.originalname, {
        folder: FOLDERS.APP_SETTINGS,
        customFileName: 'favicon',
      });
      updates.favicon = newFaviconUrl;

      if (currentSettings.favicon) {
        await deleteFromSpace(currentSettings.favicon).catch(console.error);
      }
    } else if (updates.favicon === '' || updates.favicon === 'null') {
      if (currentSettings.favicon) {
        await deleteFromSpace(currentSettings.favicon).catch(console.error);
      }
      updates.favicon = null;
    } else {
      updates.favicon = currentSettings.favicon;
    }

    // ===== UPDATE SETTINGS IN TRANSACTION =====
    const settings = await settingsService.getSettings();
    Object.assign(settings, updates);
    await settings.save({ session });

    // Commit transaction
    await session.commitTransaction();
    session.endSession();

    return settings;
  } catch (error) {
    console.error(' Transaction failed:', error);

    // Rollback
    await session.abortTransaction();
    session.endSession();

    // Optionally delete newly uploaded files if rollback triggered
    if (updates.appLogo && !updates.appLogo.includes(currentSettings?.appLogo || '')) {
      await deleteFromSpace(updates.appLogo).catch(console.error);
    }
    if (updates.favicon && !updates.favicon.includes(currentSettings?.favicon || '')) {
      await deleteFromSpace(updates.favicon).catch(console.error);
    }

    throw new Error('Failed to update settings, rolled back changes.');
  }
};






const resetSettings = async () => {
  await AppSettings.deleteMany({});
  return AppSettings.create({});
};


export const settingsService = {
  getSettings,
  updateSettings,
  resetSettings
}