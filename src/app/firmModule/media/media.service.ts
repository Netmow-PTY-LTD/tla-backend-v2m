import { uploadToSpaces } from '../../config/upload';
import { HTTP_STATUS } from '../../constant/httpStatus';
import { sendNotFoundResponse } from '../../errors/custom.error';
import { AppError } from '../../errors/error';
import { TUploadedFile } from '../../interface/file.interface';
import { FirmProfile } from '../Firm/firm.model';
import FirmMedia from './media.model';


const updateFirmMediaIntoDB = async (
  userId: string,
  payload: {
    videos: string; // single video URL from input
  },
  files: TUploadedFile[],
) => {
  const firmProfile = await FirmProfile.findOne({ userId: userId });

  if (!firmProfile) {
    return sendNotFoundResponse('firm profile data');
  }

  let uploadedUrls: string[] = [];

  if (Array.isArray(files) && files.length > 0) {
    try {
      const uploadPromises = files
        .filter((file) => file?.buffer)
        .map((file) =>
          uploadToSpaces(file.buffer as Buffer, file.originalname, userId),
        );

      uploadedUrls = await Promise.all(uploadPromises);
    } catch (err) {
      throw new AppError(
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        'File upload failed',
      );
    }
  }

  // Push new photos and single video (if provided) into their arrays
  const update: any = {};
  if (uploadedUrls.length > 0) {
    update.$push = { photos: { $each: uploadedUrls } };
  }

  if (payload.videos) {
    update.$push = update.$push || {};
    update.$push.videos = payload.videos;
  }

  const updatedFirmMedia = await FirmMedia.findOneAndUpdate(
    { firmProfileId: firmProfile._id },
    update,
    {
      upsert: true,
      new: true,
    },
  );

  return updatedFirmMedia;
};




const removeFirmMediaFromDB = async (
  userId: string,
  type: 'photos' | 'videos',
  index: number
) => {
  const firmProfile = await FirmProfile.findOne({ userId: userId });

  if (!firmProfile) {
    return {
      statusCode: 200,
      success: false,
      message: 'Firm not found',
      data: null,
    };
  }

  const firmMedia = await FirmMedia.findOne({ firmProfileId: firmProfile._id });
  if (!firmMedia) return null;

  // Check if index is valid
  if (index < 0 || index >= firmMedia[type].length) return firmMedia;

  // Remove the item at that index
  firmMedia[type].splice(index, 1);
  await firmMedia.save();

  return firmMedia;
};



/**
 * Get Firm Media by Firm User ID
 */
const getFirmMediaFromDB = async (userId: string) => {
  const firmProfile = await FirmProfile.findOne({ userId: userId });

  if (!firmProfile) {
    return sendNotFoundResponse('firm profile data');
  }

  const firmMedia = await FirmMedia.findOne({
    firmProfileId: firmProfile._id,
  });

  return firmMedia;
};








export const FirmMediaService = {
  updateFirmMediaIntoDB,
  removeFirmMediaFromDB,
  getFirmMediaFromDB
};
