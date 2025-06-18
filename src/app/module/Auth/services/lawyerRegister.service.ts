import mongoose from 'mongoose';
import UserProfile from '../../User/models/user.model';

import { AppError } from '../../../errors/error';
import { HTTP_STATUS } from '../../../constant/httpStatus';
import User from '../models/auth.model';
import CompanyProfile from '../../User/models/companyProfile.model';
import { LawyerServiceMap } from '../../User/models/lawyerServiceMap.model';
import ZipCode from '../../Geo/Country/models/zipcode.model';
import { UserLocationServiceMap } from '../../Settings/LeadSettings/models/UserLocationServiceMap.model';
import { createToken } from '../utils/auth.utils';
import config from '../../../config';
import { StringValue } from 'ms';
import { IUser } from '../interfaces/auth.interface';
import { createLeadService } from '../utils/lawyerRegister.utils';

const lawyerRegisterUserIntoDB = async (payload: IUser) => {
  // Start a database session for the transaction
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Check if the user already exists by email
    const existingUser = await User.isUserExistsByEmail(payload.email);
    if (existingUser) {
      throw new AppError(HTTP_STATUS.CONFLICT, 'This user already exists!');
    }

    // Separate the profile data from the user data
    const { profile, lawyerServiceMap, companyInfo, ...userData } = payload;

    // Create the user document in the database
    const [newUser] = await User.create([userData], { session });

    // Prepare the profile data with a reference to the user
    const profileData = {
      ...profile,
      user: newUser._id,
    };

    // Create the user profile document in the database
    const [newProfile] = await UserProfile.create([profileData], { session });

    // Link the profile to the newly created user
    newUser.profile = newProfile._id;
    await newUser.save({ session });

    // compnay profile map create

    if (companyInfo?.companyTeam) {
      const companyProfileMapData = {
        ...companyInfo,
        contactEmail: userData.email,
        userProfileId: newProfile._id,
      };

      await CompanyProfile.create([companyProfileMapData], { session });
    }

    // lawyer service map create

    if (newUser.regUserType === 'lawyer') {
      const lawyerServiceMapData = {
        ...lawyerServiceMap,
        userProfile: newProfile._id,
      };

      await LawyerServiceMap.create([lawyerServiceMapData], { session });
    }

    const locationGroup = await ZipCode.findOne({
      countryId: newProfile?.country,
      zipCodeType: 'default',
    });

    const userLocationServiceMapData = {
      userProfileId: newProfile._id,
      locationGroupId: locationGroup?._id,
      locationType: 'nation_wide',
      serviceIds: lawyerServiceMap.services || [],
    };

    await UserLocationServiceMap.create([userLocationServiceMapData], {
      session,
    });

    // ✅ Create lead service entries using session
    await createLeadService(newUser?._id, lawyerServiceMap.services, session);

    // Commit the transaction (save changes to the database)
    await session.commitTransaction();
    session.endSession();

    // Generate the access token for the user
    const jwtPayload = {
      userId: newUser._id,
      email: newUser.email,
      // username: newUser.username,
      role: newUser.role,
      accountStatus: newUser.accountStatus,
    };

    const accessToken = createToken(
      jwtPayload,
      config.jwt_access_secret as StringValue,
      config.jwt_access_expires_in as StringValue,
    );

    // Generate the refresh token for the user
    const refreshToken = createToken(
      jwtPayload,
      config.jwt_refresh_secret as StringValue,
      config.jwt_refresh_expires_in as StringValue,
    );

    // Return the generated tokens and user data
    return {
      accessToken,
      refreshToken,
      userData: newUser,
    };
  } catch (error) {
    // If an error occurs, abort the transaction to avoid incomplete data
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

export const lawyerRegisterService = {
  lawyerRegisterUserIntoDB,
};
