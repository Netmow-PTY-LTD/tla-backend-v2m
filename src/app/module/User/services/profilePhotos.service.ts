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
  file: TUploadedFile,
) => {
  const userProfile = await UserProfile.findOne({ user: userId });

  if (!userProfile) {
    // Return early if userProfile is not found — no error
    return sendNotFoundResponse('user profile data');
  }

  // ✅ Handle file upload if provided
  if (file?.buffer) {
    try {
      const uploadedUrl = await uploadToSpaces(
        file.buffer,
        file.originalname,
        userId,
      );
      payload.photo = uploadedUrl;
      // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
    } catch (err) {
      throw new AppError(
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        'File upload failed',
      );
    }
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
