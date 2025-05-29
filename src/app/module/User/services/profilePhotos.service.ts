import { uploadToSpaces } from '../../../config/upload';
import { HTTP_STATUS } from '../../../constant/httpStatus';
import { sendNotFoundResponse } from '../../../errors/custom.error';
import { AppError } from '../../../errors/error';
import { TUploadedFile } from '../../../interface/file.interface';

import { IProfilePhotos } from '../interfaces/profiePhotos.interface';

import ProfilePhotos from '../models/profilePhotos';
import UserProfile from '../models/user.model';

const updateProfilePhotosIntoDB = async (
  userId: string,
  payload: Partial<IProfilePhotos>,
  files?: TUploadedFile[],
) => {
  const userProfile = await UserProfile.findOne({ user: userId });

  if (!userProfile) {
    // Return early if userProfile is not found — no error
    return sendNotFoundResponse('user profile data');
  }

  if (files?.length) {
    const uploadedUrls: string[] = [];

    for (const file of files) {
      if (!file.buffer) {
        throw new AppError(
          HTTP_STATUS.BAD_REQUEST,
          'One or more uploaded files are missing buffers.',
        );
      }

      try {
        const url = await uploadToSpaces(
          file.buffer,
          file.originalname,
          userId,
        );
        uploadedUrls.push(url);
        // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
      } catch (err) {
        throw new AppError(
          HTTP_STATUS.INTERNAL_SERVER_ERROR,
          `Failed to upload file: ${file.originalname}`,
        );
      }
    }

    // ✅ Assign uploaded photo URLs to payload
    payload.photos = uploadedUrls;
  }
  // Update the company  profile in the database

  const updateProfilePhotos = await ProfilePhotos.findOneAndUpdate(
    { userProfileId: userProfile._id },
    payload,
    {
      upsert: true,
      new: true,
    },
  );

  return updateProfilePhotos;
};

export const ProfilePhotosService = {
  updateProfilePhotosIntoDB,
};
