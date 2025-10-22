import mongoose from 'mongoose';
import { uploadToSpaces } from '../../config/upload';
import { sendNotFoundResponse } from '../../errors/custom.error';

import { TUploadedFile } from '../../interface/file.interface';
import ZipCode from '../Country/zipcode.model';

import { ICompanyProfile } from './companyProfile.interface';
import CompanyProfile from './companyProfile.model';
import UserProfile from './user.model';
import { LawyerRequestAsMember } from '../../firmModule/lawyerRequest/lawyerRequest.model';
import { Types } from 'mongoose';
import { FOLDERS } from '../../constant';

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
      // const uploadedUrl = await uploadToSpaces(
      //   file.buffer,
      //   file.originalname,
      //   userId,
      // );

       const uploadedUrl = await uploadToSpaces(file.buffer, file.originalname, {
        folder: FOLDERS.FIRMS,
        entityId: `logos_${userId}`,
      });


      // payload.logoUrl = uploadedUrl;
      companyProfileData.logoUrl = uploadedUrl;

      // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
    } catch (err) {
      throw new Error('File upload failed');
    }
  }






  if (addressInfo?.zipcode && addressInfo.postalCode && addressInfo?.countryCode && addressInfo?.countryId) {

    try {
      const query = {
        zipcode: addressInfo.zipcode,
        countryCode: addressInfo.countryCode,
        postalCode: addressInfo.postalCode,
        countryId: new mongoose.Types.ObjectId(addressInfo.countryId),
      };


      const zipCodeExists = await ZipCode.findOne(query);


      if (!zipCodeExists) {
        await ZipCode.create({
          zipcode: addressInfo.zipcode,
          postalCode: addressInfo.postalCode,
          countryId: new mongoose.Types.ObjectId(addressInfo.countryId),
          zipCodeType: addressInfo.zipCodeType || 'custom',
          countryCode: addressInfo.countryCode,
          latitude: addressInfo.latitude,
          longitude: addressInfo.longitude,
        });

      }
    } catch (err: unknown) {
      console.error("ZipCode save error:", err);
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

interface FirmRequestPayload {
  firmProfileId: string;
  message?: string;
}

export const firmRequestAsMember = async (
  userId: string,
  payload: FirmRequestPayload
) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // 🧩 Step 1: Get user profile inside transaction
    const userProfile = await UserProfile.findOne({ user: userId })
      .populate<{ user: { email: string } }>('user')
      .session(session);

    if (!userProfile) {
      await session.abortTransaction();
      session.endSession();
      return null;
    }

    // 🧩 Step 2: Create membership request
    const [newRequest] = await LawyerRequestAsMember.create(
      [
        {
          firmProfileId: new Types.ObjectId(payload.firmProfileId),
          lawyerId: userProfile._id,
          status: 'pending',
          message:
            payload.message ||
            `Lawyer ${userProfile.user?.email ?? 'unknown'} requested to join this firm as a member.`,
          isActive: true,
        },
      ],
      { session }
    );

    // 🧩 Step 3: Update user profile to mark request flag
    userProfile.isFirmMemberRequest = true;
    userProfile.activeFirmRequestId = newRequest._id as Types.ObjectId;
    await userProfile.save({ session });

    // ✅ Commit the transaction
    await session.commitTransaction();
    session.endSession();

    // Return the created request (newRequest is the created document)
    return newRequest;
  } catch (error) {
    console.error('Error in firmRequestAsMember:', error);
    await session.abortTransaction();
    session.endSession();
    throw error; // Rethrow to handle at controller level
  }
};


export const CompanyProfileService = {
  updateCompanyProfileIntoDB,
  firmRequestAsMember,
};
