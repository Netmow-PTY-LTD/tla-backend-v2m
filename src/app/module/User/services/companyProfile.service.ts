import mongoose from 'mongoose';
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


if (addressInfo?.zipcode && addressInfo?.countryCode && addressInfo?.countryId) {

  try {
    const query = {
      zipcode: addressInfo.zipcode,
      countryCode: addressInfo.countryCode,
      countryId: new mongoose.Types.ObjectId(addressInfo.countryId),
    };
  

    const zipCodeExists = await ZipCode.findOne(query);


    if (!zipCodeExists) {
       await ZipCode.create({
        zipcode: addressInfo.zipcode,
        countryId: new mongoose.Types.ObjectId(addressInfo.countryId),
        zipCodeType: addressInfo.zipCodeType || 'custom',
        countryCode: addressInfo.countryCode,
        latitude: addressInfo.latitude,
        longitude: addressInfo.longitude,
      });
      
    }
  } catch (err:unknown) {
    console.error("ZipCode save error:",  err);
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
