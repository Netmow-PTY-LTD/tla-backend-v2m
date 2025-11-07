import { Request, Response } from 'express';
import { HTTP_STATUS } from '../../constant/httpStatus';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { settingsService } from './settings.service';
import { deleteFromSpace, uploadToSpaces } from '../../config/upload';
import { FOLDERS } from '../../constant';


const getAppSettings = catchAsync(async (_req: Request, res: Response) => {
  const result = await settingsService.getSettings();

  sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: 'App settings retrieved successfully',
    data: result,
  });
});

const updateAppSettings = catchAsync(async (req: Request, res: Response) => {
  // const payload = req.body;

  const payload = { ...req.body } as any;

  const files = req.files as { [key: string]: Express.Multer.File[] } | undefined;

  const currentSettings = await settingsService.getSettings();

  console.log('check payload ==>',payload)

  // ===== APP LOGO =====
  if (files?.appLogo?.[0]) {
    // New file uploaded
    const file = files.appLogo[0];
    const newLogoUrl = await uploadToSpaces(file.buffer, file.originalname, {
      folder: FOLDERS.APP_SETTINGS,
      customFileName: 'app-logo',
    });
    payload.appLogo = newLogoUrl;

    if (currentSettings.appLogo) {
      await deleteFromSpace(currentSettings.appLogo).catch(console.error);
    }
  } else if (payload.appLogo === '' || payload.appLogo === 'null') {
    // Frontend requested to remove logo
    if (currentSettings.appLogo) {
      await deleteFromSpace(currentSettings.appLogo).catch(console.error);
    }
    payload.appLogo = null;
  } else {
    // Keep existing logo URL
    payload.appLogo = currentSettings.appLogo;
  }

  // ===== FAVICON =====
  if (files?.favicon?.[0]) {
    // New file uploaded
    const file = files.favicon[0];
    const newFaviconUrl = await uploadToSpaces(file.buffer, file.originalname, {
      folder: FOLDERS.APP_SETTINGS,
      customFileName: 'favicon',
    });
    payload.favicon = newFaviconUrl;

    if (currentSettings.favicon) {
      await deleteFromSpace(currentSettings.favicon).catch(console.error);
    }
  } else if (payload.favicon === '' || payload.favicon === "null") {
    // Frontend requested to remove favicon
    if (currentSettings.favicon) {
      await deleteFromSpace(currentSettings.favicon).catch(console.error);
    }
    payload.favicon = null;
  } else {
    // Keep existing favicon URL
    payload.favicon = currentSettings.favicon;
  }



  const result = await settingsService.updateSettings(payload);

  sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: 'App settings updated successfully',
    data: result,
  });
});

const resetAppSettings = catchAsync(async (_req: Request, res: Response) => {
  const result = await settingsService.resetSettings();

  sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: 'App settings reset successfully',
    data: result,
  });
});

export const settingsController = {
  getAppSettings,
  updateAppSettings,
  resetAppSettings,
};