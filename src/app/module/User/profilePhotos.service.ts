import mongoose from 'mongoose';
import { deleteFromSpace, uploadToSpaces } from '../../config/upload';
import { FOLDERS } from '../../constant';
import { HTTP_STATUS } from '../../constant/httpStatus';
import { sendNotFoundResponse } from '../../errors/custom.error';
import { AppError } from '../../errors/error';
import { TUploadedFile } from '../../interface/file.interface';


import ProfilePhotos from './profilePhotos';
import UserProfile from './user.model';
import { redisClient } from '../../config/redis.config';
import { CacheKeys } from '../../config/cacheKeys';

const updateProfilePhotosIntoDB = async (
  userId: string,
  payload: {
    videos: string; // single video URL from input
  },
  files: TUploadedFile[],
) => {

   await redisClient.del(CacheKeys.USER_INFO(userId));

  const userProfile = await UserProfile.findOne({ user: userId });

  if (!userProfile) {
    return sendNotFoundResponse('user profile data');
  }

  let uploadedUrls: string[] = [];

  if (Array.isArray(files) && files.length > 0) {
    try {
      const uploadPromises = files
        .filter((file) => file?.buffer)
        .map((file) =>
          // uploadToSpaces(file.buffer as Buffer, file.originalname, userId),
          uploadToSpaces(file.buffer as Buffer, file.originalname, {
            folder: FOLDERS.MEDIA,
            entityId: `media_${userId}`,
          }),

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

  const updatedProfilePhotos = await ProfilePhotos.findOneAndUpdate(
    { userProfileId: userProfile._id },
    update,
    {
      upsert: true,
      new: true,
    },
  );

  return updatedProfilePhotos;
};

// const removeProfileMediaFromDB = async (
//   userId: string,
//   type: 'photos' | 'videos',
//   urlToRemove: string
// ) => {
//   const userProfile = await UserProfile.findOne({ user: userId });

//   if (!userProfile) {
//     return {
//       statusCode: 200,
//       success: false,
//       message: "user not found ",
//       data: null
//     }
//   }

//   const updateResult = await ProfilePhotos.findOneAndUpdate(
//     { userProfileId: userProfile._id },
//     {
//       $pull: {
//         [type]: urlToRemove,
//       },
//     },
//     { new: true }
//   );

//   return updateResult;
// };




export const removeProfileMediaFromDB = async (
  userId: string,
  type: 'photos' | 'videos',
  urlToRemove: string
) => {

    await redisClient.del(CacheKeys.USER_INFO(userId));
  // Start MongoDB transaction
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Step 1️: Find user profile
    const userProfile = await UserProfile.findOne({ user: userId }).session(session);
    if (!userProfile) {
      throw new AppError(HTTP_STATUS.NOT_FOUND, 'User profile not found');
    }

    // Step 2️: Update DB (remove the media URL)
    const updatedMedia = await ProfilePhotos.findOneAndUpdate(
      { userProfileId: userProfile._id },
      { $pull: { [type]: urlToRemove } },
      { new: true, session }
    );

    if (!updatedMedia) {
      throw new AppError(HTTP_STATUS.BAD_REQUEST, 'Failed to update media collection');
    }

    // Step 3️: Attempt to delete the file from DigitalOcean Spaces
    try {
      await deleteFromSpace(urlToRemove);
    } catch (fileErr) {
      throw new AppError(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Failed to delete file from Spaces');
    }

    // Step 4️: Commit DB transaction
    await session.commitTransaction();
    session.endSession();

    return {
      statusCode: 200,
      success: true,
      message: 'Media removed successfully',
      data: updatedMedia,
    };
  } catch (err) {
    // Step 5️: Rollback DB delete
    await session.abortTransaction();
    session.endSession();

    throw err;
  }
};







//  previous code logic update profile photos into DB
// const updateProfilePhotosIntoDB = async (
//   userId: string,
//   payload: Partial<IProfilePhotos>,
//   files: TUploadedFile[],
// ) => {
//   const userProfile = await UserProfile.findOne({ user: userId });

//   if (!userProfile) {
//     return sendNotFoundResponse('user profile data');
//   }

//   if (Array.isArray(files) && files.length > 0) {
//     try {
//       // Filter files with valid buffer and upload them in parallel
//       const uploadPromises = files
//         .filter((file) => file?.buffer)
//         .map((file) =>
//           uploadToSpaces(file.buffer as Buffer, file.originalname, userId),
//         );

//       const uploadedUrls = await Promise.all(uploadPromises);

//       // Assign uploaded URLs to payload.photos array
//       payload.photos = uploadedUrls;
//       // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
//     } catch (err) {
//       throw new AppError(
//         HTTP_STATUS.INTERNAL_SERVER_ERROR,
//         'File upload failed',
//       );
//     }
//   }

//   const updatedProfilePhotos = await ProfilePhotos.findOneAndUpdate(
//     { userProfileId: userProfile._id },
//     payload,
//     {
//       upsert: true,
//       new: true,
//     },
//   );

//   return updatedProfilePhotos;
// };




export const ProfilePhotosService = {
  updateProfilePhotosIntoDB,
  removeProfileMediaFromDB
};
