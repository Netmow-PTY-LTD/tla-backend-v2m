
import { HTTP_STATUS } from '../../constant/httpStatus';
import catchAsync from '../../utils/catchAsync';

import { FirmMediaService } from './media.service';

import sendResponse from '../../utils/sendResponse';
import { TUploadedFile } from '../../interface/file.interface';

/**
 * Add or update Firm Media (photos & videos)
 */
const updateFirmMedia = catchAsync(async (req, res) => {
  const userId = req.user.userId; // from auth middleware
  const payload = req.body;
  // const files = req.files as TUploadedFile[]; // multiple file uploads
  const files = req.files; // multiple file uploads


  const updated = await FirmMediaService.updateFirmMediaIntoDB(
    userId,
    payload,
    files as  { [fieldname: string]: TUploadedFile[] } // 👈 correct type
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


// const removeFirmMedia = catchAsync(async (req, res) => {
//   const userId = req.user.userId; // from auth middleware
//   const {type, index} = req.body; // index of media to remove

//   // Validate type
//   if (!type || !['photos', 'videos'].includes(type)) {
//     return sendResponse(res, {
//       statusCode: HTTP_STATUS.BAD_REQUEST,
//       success: false,
//       message: "Invalid media type. Must be 'photos' or 'videos'.",
//       data: null,
//     });
//   }

//   // Validate index
//   if (typeof index !== "number") {
//     return sendResponse(res, {
//       statusCode: HTTP_STATUS.BAD_REQUEST,
//       success: false,
//       message: "Index must be provided and be a number.",
//       data: null,
//     });
//   }

//   const updated = await FirmMediaService.removeFirmMediaFromDB(userId, type, index);

//   return sendResponse(res, {
//     statusCode: HTTP_STATUS.OK,
//     success: true,
//     message: `${type.slice(0, -1)} removed successfully.`,
//     data: updated,
//   });
// });

const removeFirmMedia = catchAsync(async (req, res) => {
  const userId = req.user.userId; 
  const { type, index } = req.body; 

  if (!type || !["photos", "videos", "bannerImage"].includes(type)) {
    return sendResponse(res, {
      statusCode: HTTP_STATUS.BAD_REQUEST,
      success: false,
      message: "Invalid media type. Must be 'photos', 'videos', or 'bannerImage'.",
      data: null,
    });
  }

  if ((type === "photos" || type === "videos") && typeof index !== "number") {
    return sendResponse(res, {
      statusCode: HTTP_STATUS.BAD_REQUEST,
      success: false,
      message: "Index must be provided and be a number for photos/videos.",
      data: null,
    });
  }

  const updated = await FirmMediaService.removeFirmMediaFromDB(userId, type, index);

  return sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: `${type === "bannerImage" ? "Banner image" : type.slice(0, -1)} removed successfully.`,
    data: updated,
  });
});






/**
 * 
 * Get all firm media for logged-in firm
 */
const getFirmMedia = catchAsync(async (req, res) => {
  const userId = req.user.userId; // from auth middleware
  const firmMedia = await FirmMediaService.getFirmMediaFromDB(userId);

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
