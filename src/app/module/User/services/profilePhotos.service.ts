import { uploadToSpaces } from '../../../config/upload';
import { HTTP_STATUS } from '../../../constant/httpStatus';
import { AppError } from '../../../errors/error';
import { TUploadedFile } from '../../../interface/file.interface';
import User from '../../Auth/models/auth.model';

import { IProfilePhotos } from '../interfaces/profiePhotos.interface';

import ProfilePhotos from '../models/profilePhotos';

const updateProfilePhotosIntoDB = async (
  id: string,
  payload: Partial<IProfilePhotos>,
  files?: TUploadedFile[],
) => {
  // Check if the user exists in the database by ID
  const isUserExists = await User.isUserExists(id);
  if (!isUserExists) {
    throw new AppError(HTTP_STATUS.NOT_FOUND, 'User does not exist');
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
        const url = await uploadToSpaces(file.buffer, file.originalname, id);
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
    { userProfile: id },
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
