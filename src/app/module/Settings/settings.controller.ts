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

  // ===== Upload App Logo =====
  if (files?.appLogo?.[0]) {
    const newLogoUrl = await uploadToSpaces(
      files.appLogo[0].buffer,
      files.appLogo[0].originalname,
      {
        folder: FOLDERS.APP_SETTINGS,
        customFileName: 'app-logo',
      }
    );
    payload.appLogo = newLogoUrl;

    // Delete old logo
    if (currentSettings.appLogo) deleteFromSpace(currentSettings.appLogo).catch(console.error);
  }

  // ===== Upload Favicon =====
  if (files?.favicon?.[0]) {
    const newFaviconUrl = await uploadToSpaces(
      files.favicon[0].buffer,
      files.favicon[0].originalname,
      {
        folder: FOLDERS.APP_SETTINGS,
        customFileName: 'favicon',
      }
    );
    payload.favicon = newFaviconUrl;

    // Delete old favicon
    if (currentSettings.favicon) deleteFromSpace(currentSettings.favicon).catch(console.error);
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