import { Request, Response } from 'express';
import { HTTP_STATUS } from '../../../constant/httpStatus';
import catchAsync from '../../../utils/catchAsync';
import sendResponse from '../../../utils/sendResponse';
import { settingsService } from '../services/settings.service';


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
  const payload = req.body;
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