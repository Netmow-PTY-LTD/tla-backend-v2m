/* eslint-disable no-undef */


import mongoose from "mongoose";
import { deleteFromSpace, uploadToSpaces } from "../../config/upload";
import { FOLDERS } from "../../constant";
import { IAppSettings } from "./settings.interface";
import { AppSettings } from "./settings.model";
import { envConfigService } from "../EnvConfig/envConfig.service";


const getSettings = async () => {
  let settings = await AppSettings.findOne();
  if (!settings) {
    settings = await AppSettings.create({});
  }

  // Update firm_client_url based on EnvConfig
  const firmClientUrlConfig = await envConfigService.getConfigByKey('FIRM_CLIENT_URL');
  if (firmClientUrlConfig) {
    settings.firm_client_url = firmClientUrlConfig.value;
  }

  return settings;
};


// export const updateSettings = async (
//   updates: Partial<IAppSettings>,
//   files?: Record<string, Express.Multer.File[]>
// ) => {
//   const session = await mongoose.startSession();
//   session.startTransaction();

//   const currentSettings = await settingsService.getSettings();
//   try {

//     // ===== APP LOGO =====
//     if (files?.appLogo?.[0]) {
//       const file = files.appLogo[0];
//       const newLogoUrl = await uploadToSpaces(file.buffer, file.originalname, {
//         folder: FOLDERS.APP_SETTINGS,
//         customFileName: 'app-logo',
//       });
//       updates.appLogo = newLogoUrl;

//       if (currentSettings.appLogo) {
//         await deleteFromSpace(currentSettings.appLogo).catch(console.error);
//       }
//     } else if (updates.appLogo === '' || updates.appLogo === 'null') {
//       if (currentSettings.appLogo) {
//         await deleteFromSpace(currentSettings.appLogo).catch(console.error);
//       }
//       updates.appLogo = null;
//     } else {
//       updates.appLogo = currentSettings.appLogo;
//     }

//     // ===== FAVICON =====
//     if (files?.favicon?.[0]) {
//       const file = files.favicon[0];
//       const newFaviconUrl = await uploadToSpaces(file.buffer, file.originalname, {
//         folder: FOLDERS.APP_SETTINGS,
//         customFileName: 'favicon',
//       });
//       updates.favicon = newFaviconUrl;

//       if (currentSettings.favicon) {
//         await deleteFromSpace(currentSettings.favicon).catch(console.error);
//       }
//     } else if (updates.favicon === '' || updates.favicon === 'null') {
//       if (currentSettings.favicon) {
//         await deleteFromSpace(currentSettings.favicon).catch(console.error);
//       }
//       updates.favicon = null;
//     } else {
//       updates.favicon = currentSettings.favicon;
//     }

//     // ===== UPDATE SETTINGS IN TRANSACTION =====
//     const settings = await settingsService.getSettings();
//     Object.assign(settings, updates);
//     await settings.save({ session });

//     // Commit transaction
//     await session.commitTransaction();
//     session.endSession();

//     return settings;
//   } catch (error) {
//     console.error(' Transaction failed:', error);

//     // Rollback
//     await session.abortTransaction();
//     session.endSession();

//     // Optionally delete newly uploaded files if rollback triggered
//     if (updates.appLogo && !updates.appLogo.includes(currentSettings?.appLogo || '')) {
//       await deleteFromSpace(updates.appLogo).catch(console.error);
//     }
//     if (updates.favicon && !updates.favicon.includes(currentSettings?.favicon || '')) {
//       await deleteFromSpace(updates.favicon).catch(console.error);
//     }

//     throw new Error('Failed to update settings, rolled back changes.');
//   }
// };


export const updateSettings = async (
  updates: Partial<IAppSettings>,
  files?: Record<string, Express.Multer.File[]>
) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  const currentSettings = await AppSettings.findOne();

  try {
    // ===== APP LOGO =====
    if (files?.appLogo?.[0]) {
      const file = files.appLogo[0];
      const newLogoUrl = await uploadToSpaces(file.buffer, file.originalname, {
        folder: FOLDERS.APP_SETTINGS,
        customFileName: 'app-logo',
      });
      updates.appLogo = newLogoUrl;

      if (currentSettings?.appLogo) {
        await deleteFromSpace(currentSettings.appLogo).catch(console.error);
      }
    } else if (updates.appLogo === '' || updates.appLogo === 'null') {
      if (currentSettings?.appLogo) {
        await deleteFromSpace(currentSettings.appLogo).catch(console.error);
      }
      updates.appLogo = null;
    } else {
      updates.appLogo = currentSettings?.appLogo ?? null;
    }

    // ===== FAVICON =====
    if (files?.favicon?.[0]) {
      const file = files.favicon[0];
      const newFaviconUrl = await uploadToSpaces(file.buffer, file.originalname, {
        folder: FOLDERS.APP_SETTINGS,
        customFileName: 'favicon',
      });
      updates.favicon = newFaviconUrl;

      if (currentSettings?.favicon) {
        await deleteFromSpace(currentSettings.favicon).catch(console.error);
      }
    } else if (updates.favicon === '' || updates.favicon === 'null') {
      if (currentSettings?.favicon) {
        await deleteFromSpace(currentSettings.favicon).catch(console.error);
      }
      updates.favicon = null;
    } else {
      updates.favicon = currentSettings?.favicon ?? null;
    }

    // ===== UPDATE FIRM_CLIENT_URL IN ENV_CONFIG =====
    if (updates.firm_client_url !== undefined) {
      await envConfigService.upsertConfig('FIRM_CLIENT_URL', updates.firm_client_url || '', {
        group: 'Firm Application',
        type: 'url',
        description: 'Firm client application URL',
      });
    }

    // ===== UPDATE SETTINGS DOCUMENT =====
    const settings = await AppSettings.findOneAndUpdate(
      {}, // assuming single global settings document
      { $set: updates },
      { new: true, upsert: true, session }
    );

    await session.commitTransaction();
    session.endSession();

    return settings;
  } catch (error) {
    console.error('❌ Transaction failed:', error);

    await session.abortTransaction();
    session.endSession();

    // Rollback uploaded files if DB update failed
    if (updates.appLogo && updates.appLogo !== currentSettings?.appLogo) {
      await deleteFromSpace(updates.appLogo).catch(console.error);
    }
    if (updates.favicon && updates.favicon !== currentSettings?.favicon) {
      await deleteFromSpace(updates.favicon).catch(console.error);
    }

    throw new Error('Failed to update settings — all changes rolled back.');
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