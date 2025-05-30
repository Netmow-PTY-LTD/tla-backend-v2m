import { uploadToSpaces } from '../../../config/upload';
import { HTTP_STATUS } from '../../../constant/httpStatus';
import { sendNotFoundResponse } from '../../../errors/custom.error';
import { AppError } from '../../../errors/error';
import { TUploadedFile } from '../../../interface/file.interface';
import User from '../../Auth/models/auth.model';
import { IAccreditation } from '../interfaces/profileAccreditation';

import Accreditation from '../models/ProfileAccreditation';

const updateProfileAccreditationIntoDB = async (
  id: string,
  payload: Partial<IAccreditation>,
  file?: TUploadedFile,
) => {
  // Check if the user exists in the database by ID
  const isUserExists = await User.isUserExists(id);
  if (!isUserExists) {
    return sendNotFoundResponse('user not found for update accreditation');
  }

  // ✅ Handle file upload if provided
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

  // Update the company  profile in the database

  const updateAccreditation = await Accreditation.findOneAndUpdate(
    { userProfileId: id },
    payload,
    {
      upsert: true,
      new: true,
    },
  );

  // Return the updated profile
  return updateAccreditation;
};

export const accreditationService = {
  updateProfileAccreditationIntoDB,
};
