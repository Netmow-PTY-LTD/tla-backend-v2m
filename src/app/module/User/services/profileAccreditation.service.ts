import { uploadToSpaces } from '../../../config/upload';
import { HTTP_STATUS } from '../../../constant/httpStatus';
import { AppError } from '../../../errors/error';
import { TUploadedFile } from '../../../interface/file.interface';
import User from '../../Auth/models/auth.model';
import { ICompanyProfile } from '../interfaces/companyProfile.interface';
import CompanyProfile from '../models/companyProfile.model';

const updateProfileAccreditationIntoDB = async (
  id: string,
  payload: Partial<ICompanyProfile>,
  file?: TUploadedFile,
) => {
  // Check if the user exists in the database by ID
  const isUserExists = await User.isUserExists(id);
  if (!isUserExists) {
    throw new AppError(HTTP_STATUS.NOT_FOUND, 'User does not exist');
  }

  // ✅ Handle file upload if provided
  if (file?.buffer) {
    try {
      const uploadedUrl = await uploadToSpaces(
        file.buffer,
        file.originalname,
        id,
      );
      payload.logoUrl = uploadedUrl;
      // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
    } catch (err) {
      throw new AppError(
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        'File upload failed',
      );
    }
  }

  // Update the company  profile in the database

  const updateCompanyProfile = await CompanyProfile.findOneAndUpdate(
    { userProfile: id },
    payload,
    {
      upsert: true,
      new: true,
    },
  );

  // Return the updated profile
  return updateCompanyProfile;
};

export const CompanyProfileService = {
  updateProfileAccreditationIntoDB,
};
