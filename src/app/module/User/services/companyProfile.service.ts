import { uploadToSpaces } from '../../../config/upload';

import { TUploadedFile } from '../../../interface/file.interface';

import { ICompanyProfile } from '../interfaces/companyProfile.interface';
import CompanyProfile from '../models/companyProfile.model';
import UserProfile from '../models/user.model';

const updateCompanyProfileIntoDB = async (
  userId: string,
  payload: Partial<ICompanyProfile>,
  file?: TUploadedFile,
) => {
  // Step 1: Get the userProfileId
  const userProfile = await UserProfile.findOne({ user: userId });

  if (!userProfile) {
    // Return early if userProfile is not found — no error
    return null;
  }

  // Step 2: Handle file upload if present
  if (file?.buffer) {
    try {
      const uploadedUrl = await uploadToSpaces(
        file.buffer,
        file.originalname,
        userId,
      );
      payload.logoUrl = uploadedUrl;
      // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
    } catch (err) {
      throw new Error('File upload failed');
    }
  }

  // Step 3: Update or create company profile
  const updatedCompanyProfile = await CompanyProfile.findOneAndUpdate(
    { userProfileId: userProfile._id },
    payload,
    {
      upsert: true,
      new: true,
      runValidators: true,
    },
  );

  return updatedCompanyProfile;
};

export const CompanyProfileService = {
  updateCompanyProfileIntoDB,
};
