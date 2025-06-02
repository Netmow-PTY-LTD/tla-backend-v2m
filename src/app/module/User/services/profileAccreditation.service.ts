import { uploadToSpaces } from '../../../config/upload';
import { HTTP_STATUS } from '../../../constant/httpStatus';
import { sendNotFoundResponse } from '../../../errors/custom.error';
import { AppError } from '../../../errors/error';
import { TUploadedFile } from '../../../interface/file.interface';

import { IAccreditation } from '../interfaces/profileAccreditation';

import Accreditation from '../models/ProfileAccreditation';
import UserProfile from '../models/user.model';

// const updateProfileAccreditationIntoDB = async (
//   id: string,
//   payload: Partial<IAccreditation>,
//   file?: TUploadedFile,
// ) => {
//   // Check if the user exists in the database by ID
//   const userProfile = await UserProfile.findOne({ user: id });

//   if (!userProfile) {
//     // Return early if userProfile is not found — no error
//     return sendNotFoundResponse('user profile data');
//   }

//   // ✅ Handle file upload if provided
//   if (file?.buffer) {
//     try {
//       const uploadedUrl = await uploadToSpaces(
//         file.buffer,
//         file.originalname,
//         id,
//       );
//       payload.attachment = uploadedUrl;
//       // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
//     } catch (err) {
//       throw new AppError(
//         HTTP_STATUS.INTERNAL_SERVER_ERROR,
//         'File upload failed',
//       );
//     }
//   }

//   // Update the company  profile in the database

//   const updateAccreditation = await Accreditation.findOneAndUpdate(
//     { userProfileId: userProfile._id },
//     payload,
//     {
//       upsert: true,
//       new: true,
//     },
//   );

//   // Return the updated profile
//   return updateAccreditation;
// };

const updateProfileAccreditationIntoDB = async (
  id: string,
  payload: Partial<IAccreditation> & { _id?: string },
  file?: TUploadedFile,
) => {
  // Find the user's profile by user ID
  const userProfile = await UserProfile.findOne({ user: id });

  if (!userProfile) {
    return sendNotFoundResponse('user profile data');
  }

  // Handle file upload if provided
  if (file?.buffer) {
    try {
      const uploadedUrl = await uploadToSpaces(
        file.buffer,
        file.originalname,
        id,
      );
      payload.attachment = uploadedUrl;
      // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
    } catch (err) {
      throw new AppError(
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        'File upload failed',
      );
    }
  }

  let accreditation;

  if (payload._id) {
    // Try updating existing accreditation using the _id
    accreditation = await Accreditation.findByIdAndUpdate(
      payload._id,
      {
        ...payload,
        userProfileId: userProfile._id, // ensure association
      },
      { new: true },
    );
  }

  // If no accreditation found or no _id in payload, create new one
  if (!accreditation) {
    accreditation = await Accreditation.create({
      ...payload,
      userProfileId: userProfile._id,
    });
  }

  return accreditation;
};

export const accreditationService = {
  updateProfileAccreditationIntoDB,
};
