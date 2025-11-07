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

  const result = await settingsService.updateSettings(payload , files);

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