import mongoose from 'mongoose';
import UserProfile from '../../User/models/user.model';

import { AppError } from '../../../errors/error';
import { HTTP_STATUS } from '../../../constant/httpStatus';
import User from '../models/auth.model';

import ZipCode from '../../Geo/Country/models/zipcode.model';
import { UserLocationServiceMap } from '../../Settings/LeadSettings/models/UserLocationServiceMap.model';
import { createToken } from '../utils/auth.utils';
import config from '../../../config';
import { StringValue } from 'ms';
import { USER_ROLE } from '../../../constant';

const clientRegisterUserIntoDB = async (payload: any) => {
  // Start a database session for the transaction
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Separate the profile data from the user data
    const { formdata: leadDetails, countryId, serviceId, questions } = payload;

    // Check if the user already exists by email
    const existingUser = await User.isUserExistsByEmail(payload.email);
    if (existingUser) {
      throw new AppError(HTTP_STATUS.CONFLICT, 'This user already exists!');
    }

    const userData = {
      username: leadDetails.username,
      email: leadDetails.email,
      role: USER_ROLE.USER,
      regUserType: 'client',
      password: '123456',
    };
    // Create the user document in the database
    const [newUser] = await User.create([userData], { session });

    // Prepare the profile data with a reference to the user
    const profileData = {
      user: newUser._id,
      country: countryId,
      name: leadDetails.name,
    };

    // Create the user profile document in the database
    const [newProfile] = await UserProfile.create([profileData], { session });

    // Link the profile to the newly created user
    newUser.profile = newProfile._id;
    await newUser.save({ session });

    // lawyer service map create

    if (newUser.regUserType === 'client') {
      console.log('test');
    }

    const locationGroup = await ZipCode.findOne({
      countryId: newProfile?.country,
      zipCodeType: 'default',
    });

    const userLocationServiceMapData = {
      userProfileId: newProfile._id,
      locationGroupId: locationGroup?._id,
      locationType: 'nation_wide',
      serviceIds: [],
    };

    await UserLocationServiceMap.create([userLocationServiceMapData], {
      session,
    });

    // Commit the transaction (save changes to the database)
    await session.commitTransaction();
    session.endSession();

    // Generate the access token for the user
    const jwtPayload = {
      userId: newUser._id,
      email: newUser.email,
      username: newUser.username,
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

export const clientRegisterService = {
  clientRegisterUserIntoDB,
};
