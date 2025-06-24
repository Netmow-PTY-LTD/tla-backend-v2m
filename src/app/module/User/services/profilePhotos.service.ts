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
  files: TUploadedFile[],
) => {
  const userProfile = await UserProfile.findOne({ user: userId });

  if (!userProfile) {
    return sendNotFoundResponse('user profile data');
  }

  if (Array.isArray(files) && files.length > 0) {
    try {
      // Filter files with valid buffer and upload them in parallel
      const uploadPromises = files
        .filter((file) => file?.buffer)
        .map((file) =>
          uploadToSpaces(file.buffer as Buffer, file.originalname, userId),
        );

      const uploadedUrls = await Promise.all(uploadPromises);

      // Assign uploaded URLs to payload.photos array
      payload.photos = uploadedUrls;
      // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
    } catch (err) {
      throw new AppError(
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        'File upload failed',
      );
    }
  }

  const updatedProfilePhotos = await ProfilePhotos.findOneAndUpdate(
    { userProfileId: userProfile._id },
    payload,
    {
      upsert: true,
      new: true,
    },
  );

  return updatedProfilePhotos;
};
export const ProfilePhotosService = {
  updateProfilePhotosIntoDB,
};
