import { uploadToSpaces } from '../../../config/upload';
import { sendNotFoundResponse } from '../../../errors/custom.error';

import { TUploadedFile } from '../../../interface/file.interface';
import ZipCode from '../../Country/models/zipcode.model';

import { ICompanyProfile } from '../interfaces/companyProfile.interface';
import CompanyProfile from '../models/companyProfile.model';
import UserProfile from '../models/user.model';

const updateCompanyProfileIntoDB = async (
  userId: string,
  payload: Partial<ICompanyProfile>,
  file?: TUploadedFile,
) => {

  const { addressInfo, ...companyProfileData } = payload;
  // Step 1: Get the userProfileId
  const userProfile = await UserProfile.findOne({ user: userId });

  if (!userProfile) {
    // Return early if userProfile is not found — no error
    return sendNotFoundResponse(
      'user profile data not found for update company profile',
    );
  }

  // Step 2: Handle file upload if present
  if (file?.buffer) {
    try {
      const uploadedUrl = await uploadToSpaces(
        file.buffer,
        file.originalname,
        userId,
      );
      // payload.logoUrl = uploadedUrl;
      companyProfileData.logoUrl = uploadedUrl;

      // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
    } catch (err) {
      throw new Error('File upload failed');
    }
  }


  // 4️⃣ Handle ZipCode data (only if addressInfo provided)
  if (addressInfo?.zipcode && addressInfo?.countryCode && addressInfo?.countryId) {
    const zipCodeExists = await ZipCode.findOne({
      zipcode: addressInfo.zipcode,
      countryCode: addressInfo.countryCode,
      countryId: addressInfo.countryId,
      latitude: addressInfo.latitude,
      longitude: addressInfo.longitude,
    });

    if (!zipCodeExists) {
      try {
        await ZipCode.create(addressInfo);

      } catch (zipErr) {
        console.error('Failed to create ZipCode entry:', zipErr);

        throw new Error('ZipCode creation failed');
      }
    }
  }


  // Step 3: Update or create company profile
  const updatedCompanyProfile = await CompanyProfile.findOneAndUpdate(
    { userProfileId: userProfile._id },
    companyProfileData,
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
