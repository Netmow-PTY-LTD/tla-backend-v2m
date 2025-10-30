import { deleteFromSpace, uploadToSpaces } from '../../config/upload';
import { HTTP_STATUS } from '../../constant/httpStatus';
import { sendNotFoundResponse } from '../../errors/custom.error';
import { AppError } from '../../errors/error';
import { TUploadedFile } from '../../interface/file.interface';
import { validateObjectId } from '../../utils/validateObjectId';

import { IAccreditation } from './profileAccreditation.interface';

import Accreditation from './ProfileAccreditation';
import UserProfile from './user.model';
import { FOLDERS } from '../../constant';
import mongoose from 'mongoose';
import { redisClient } from '../../config/redis.config';
import { CacheKeys } from '../../config/cacheKeys';

// const updateProfileAccreditationIntoDB = async (
//   id: string,
//   payload: Partial<IAccreditation> & { _id?: string },
//   file?: TUploadedFile,
// ) => {
//   // Find the user's profile by user ID
//   const userProfile = await UserProfile.findOne({ user: id });

//   if (!userProfile) {
//     return sendNotFoundResponse('user profile data');
//   }

//   // Handle file upload if provided
//   if (file?.buffer) {
//     try {
//       // const uploadedUrl = await uploadToSpaces(
//       //   file.buffer,
//       //   file.originalname,
//       //   id,
//       // );

//       const uploadedUrl = await uploadToSpaces(file.buffer, file.originalname, {
//         folder: FOLDERS.ACCREDITATIONS,
//         entityId: `user_${id}`,
//       });


//       payload.attachment = uploadedUrl;
//       // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
//     } catch (err) {
//       throw new AppError(
//         HTTP_STATUS.INTERNAL_SERVER_ERROR,
//         'File upload failed',
//       );
//     }
//   }

//   let accreditation;

//   if (payload._id) {
//     // Try updating existing accreditation using the _id
//     accreditation = await Accreditation.findByIdAndUpdate(
//       payload._id,
//       {
//         ...payload,
//         userProfileId: userProfile._id, // ensure association
//       },
//       { new: true },
//     );
//   }

//   // If no accreditation found or no _id in payload, create new one
//   if (!accreditation) {
//     accreditation = await Accreditation.create({
//       ...payload,
//       userProfileId: userProfile._id,
//     });
//   }

//   return accreditation;
// };


// const deleteAccreditationIntoDB = async (id: string) => {
//   validateObjectId(id, 'Accreditation ');
//   const customServiceDelete = await Accreditation.findByIdAndDelete(id);

//   return customServiceDelete;
// };




const updateProfileAccreditationIntoDB = async (
  id: string,
  payload: Partial<IAccreditation> & { _id?: string },
  file?: TUploadedFile
) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  let newFileUrl: string | null = null;

  try {
    // Step 1️: Find user profile
    const userProfile = await UserProfile.findOne({ user: id }).session(session);
    if (!userProfile) {
      await session.abortTransaction();
      session.endSession();
      return sendNotFoundResponse('User profile not found');
    }

    let existingAccreditation = null;

    // Step 2️: Find existing accreditation (for update)
    if (payload._id) {
      existingAccreditation = await Accreditation.findById(payload._id).session(session);
    }

    // Step 3️: Handle file upload (if provided)
    if (file?.buffer) {
      const fileBuffer = file.buffer;
      const originalName = file.originalname;

      newFileUrl = await uploadToSpaces(fileBuffer, originalName, {
        folder: FOLDERS.ACCREDITATIONS,
        entityId: `user_${id}`,
      });

      payload.attachment = newFileUrl;
    }

    // Step 4️: Create or Update Accreditation
    let accreditation;
    if (existingAccreditation) {
      accreditation = await Accreditation.findByIdAndUpdate(
        existingAccreditation._id,
        {
          ...payload,
          userProfileId: userProfile._id,
        },
        { new: true, session }
      );
    } else {
      accreditation = await Accreditation.create(
        [
          {
            ...payload,
            userProfileId: userProfile._id,
          },
        ],
        { session }
      );
      accreditation = accreditation[0];
    }

    if (!accreditation) throw new AppError(HTTP_STATUS.BAD_REQUEST, 'Failed to save accreditation');

    // Step 5️: Commit transaction
    await session.commitTransaction();
    session.endSession();

    // Step 6️: Delete old file (non-blocking)
    if (file?.buffer && existingAccreditation?.attachment) {
      deleteFromSpace(existingAccreditation.attachment).catch((err) =>
        console.error(' Failed to delete old accreditation file:', err)
      );
    }

    return accreditation;
  } catch (err) {
    await session.abortTransaction();
    session.endSession();

    // Rollback uploaded file if DB operation failed
    if (newFileUrl) {
      deleteFromSpace(newFileUrl).catch((cleanupErr) =>
        console.error(' Failed to rollback uploaded accreditation file:', cleanupErr)
      );
    }

    throw err;
  }
};



const deleteAccreditationIntoDB = async (userId: string, id: string) => {

  validateObjectId(id, 'Accreditation');



  await redisClient.del(CacheKeys.USER_INFO(userId));

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Step 1️: Delete from DB inside transaction
    const accreditation = await Accreditation.findOneAndDelete({ _id: id }, { session });
    if (!accreditation) throw new Error('Accreditation not found');

    // Step 2️: Try deleting file (from Spaces)
    if (accreditation.attachment) {
      try {
        await deleteFromSpace(accreditation.attachment);
      } catch (err) {
        throw new Error('Failed to delete accreditation file from Spaces');
      }
    }

    // Step 3️: Commit transaction
    await session.commitTransaction();
    session.endSession();

    return accreditation;
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
};









export const accreditationService = {
  updateProfileAccreditationIntoDB,
  deleteAccreditationIntoDB,
};
