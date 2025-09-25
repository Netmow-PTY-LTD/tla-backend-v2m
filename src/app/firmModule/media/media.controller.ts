
import { HTTP_STATUS } from '../../constant/httpStatus';
import catchAsync from '../../utils/catchAsync';

import { FirmMediaService } from './media.service';

import sendResponse from '../../utils/sendResponse';
import { TUploadedFile } from '../../interface/file.interface';

/**
 * Add or update Firm Media (photos & videos)
 */
const updateFirmMedia = catchAsync(async (req, res) => {
  const firmUserId = req.user.userId; // from auth middleware
  const payload = req.body;
  const files = req.files as TUploadedFile[]; // multiple file uploads


  const updated = await FirmMediaService.updateFirmMediaIntoDB(
    firmUserId,
    payload,
    files,
  );

  return sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: 'Firm media updated successfully.',
    data: updated,
  });
});

/**
 * Remove a specific photo or video
 */
const removeFirmMedia = catchAsync(async (req, res) => {
  const firmUserId = req.user.userId; // from auth middleware
  const { type } = req.query; // photos | videos
  const { url } = req.body;   // media URL to remove

  const updated = await FirmMediaService.removeFirmMediaFromDB(
    firmUserId,
    type as 'photos' | 'videos',
    url,
  );

  return sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: 'Firm media removed successfully.',
    data: updated,
  });
});

/**
 * Get all firm media for logged-in firm
 */
const getFirmMedia = catchAsync(async (req, res) => {
  const firmUserId = req.user.userId; // from auth middleware
  const firmMedia = await FirmMediaService.getFirmMediaFromDB(firmUserId);

  return sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: 'Firm media retrieved successfully.',
    data: firmMedia,
  });
});

export const FirmMediaController = {
  updateFirmMedia,
  removeFirmMedia,
  getFirmMedia,
};
