import config from '../../../config';
import { AppError } from '../../../errors/error';
import { ILoginUser, IUser } from '../interfaces/auth.interface';
import User from '../models/auth.model';
import { createToken, verifyToken } from '../utils/auth.utils';
import { USER_STATUS } from '../constant/auth.constant';
import { StringValue } from 'ms';
import { HTTP_STATUS } from '../../../constant/httpStatus';
import bcrypt from 'bcryptjs';
import jwt, { JwtPayload } from 'jsonwebtoken';
import mongoose, { Types } from 'mongoose';
import UserProfile from '../../User/models/user.model';
import { sendEmail } from '../../../config/emailTranspoter';
import { LawyerServiceMap } from '../../User/models/lawyerServiceMap.model';
import CompanyProfile from '../../User/models/companyProfile.model';
import { UserLocationServiceMap } from '../../Settings/LeadSettings/models/UserLocationServiceMap.model';

import { validateObjectId } from '../../../utils/validateObjectId';
import LeadService from '../../Settings/LeadSettings/models/leadService.model';
import ServiceWiseQuestion from '../../Service/Question/models/ServiceWiseQuestion.model';
import ZipCode from '../../Geo/Country/models/zipcode.model';
import Option from '../../Service/Option/models/option.model';
import { sendNotFoundResponse } from '../../../errors/custom.error';

/**
 * @desc   Handles user authentication by verifying credentials and user status.
 *         Checks if the user exists, if the account is deleted or suspended,
 *         verifies the password, and generates access and refresh tokens.
 * @param  {ILoginUser} payload - The login credentials (email and password).
 * @returns {Promise<Object>} An object containing the access token, refresh token, and user data.
 */
const loginUserIntoDB = async (payload: ILoginUser) => {
  // Checking if the user exists by email
  const user = await User.isUserExistsByEmail(payload?.email);

  if (!user) {
    throw new AppError(HTTP_STATUS.NOT_FOUND, 'This user is not found !');
  }

  // Checking if the user is deleted
  const deletedAt = user?.deletedAt;
  if (deletedAt) {
    throw new AppError(HTTP_STATUS.FORBIDDEN, 'This user is deleted !');
  }

  // Checking if the user is blocked
  const userStatus = user?.accountStatus;
  if (
    userStatus === USER_STATUS.SUSPENDED ||
    userStatus === USER_STATUS.INACTIVE
  ) {
    throw new AppError(HTTP_STATUS.FORBIDDEN, `This user is ${userStatus} !`);
  }

  // Verifying if the password matches the one in the database
  if (!(await User.isPasswordMatched(payload?.password, user?.password)))
    throw new AppError(HTTP_STATUS.FORBIDDEN, 'Password do not matched');

  // Create JWT tokens (access and refresh) and return them with user data
  const jwtPayload = {
    userId: user?._id,
    username: user.username,
    email: user?.email,
    role: user?.role,
    status: user?.accountStatus,
  };

  // Generate access token
  const accessToken = createToken(
    jwtPayload,
    config.jwt_access_secret as StringValue,
    config.jwt_access_expires_in as StringValue,
  );

  // Generate refresh token
  const refreshToken = createToken(
    jwtPayload,
    config.jwt_refresh_secret as StringValue,
    config.jwt_refresh_expires_in as StringValue,
  );

  // Fetch user data
  const userData = await User.findOne({ email: payload.email });

  // Return tokens and user data
  return {
    accessToken,
    refreshToken,
    userData,
  };
};

/**
 * @desc   Registers a new user in the database by checking if the user already exists,
 *         creating a new user record, creating a profile for the user, and generating
 *         access and refresh tokens for the user.
 * @param  {IUser} payload - The user registration data.
 * @returns  An object containing the access token, refresh token, and user data.
 */

const createLeadService = async (
  userId: string,
  serviceIds: Types.ObjectId[],
  session?: mongoose.ClientSession,
) => {
  // 1. Find user profile by userId
  const userProfile = await UserProfile.findOne({ user: userId })
    .select('_id serviceIds')
    .session(session || null);

  if (!userProfile) {
    return sendNotFoundResponse('User profile not found');
  }

  // 2. Validate all serviceIds
  serviceIds.forEach((id) => validateObjectId(id.toString(), 'service'));

  // 3. Compare with existing serviceIds in userProfile
  const existingServiceIds = new Set(
    (userProfile.serviceIds || []).map((id: Types.ObjectId) => id.toString()),
  );

  const newServiceIds = serviceIds.filter(
    (id) => !existingServiceIds.has(id.toString()),
  );

  // 4. If all services already exist, return conflict response
  if (newServiceIds.length === 0) {
    throw {
      status: 409,
      message: 'All selected services already exist for this user',
      duplicates: Array.from(existingServiceIds),
    };
  }

  // 5. Append and save new serviceIds
  userProfile.serviceIds.push(...newServiceIds);
  await userProfile.save({ session });

  // 6. Create lead service entries
  for (const serviceId of newServiceIds) {
    const questions = await ServiceWiseQuestion.find({ serviceId }).session(
      session ?? null,
    );

    for (const question of questions) {
      const options = await Option.find({
        questionId: question._id,
        serviceId,
      }).session(session ?? null);

      const leadServiceInserts = options.map((option) => ({
        userProfileId: userProfile._id,
        serviceId,
        questionId: question._id,
        optionId: option._id,
        isSelected: true,
      }));

      if (leadServiceInserts.length) {
        await LeadService.insertMany(leadServiceInserts, { session });
      }
    }
  }

  return {
    userProfileId: userProfile._id,
    newServiceIds,
  };
};

const registerUserIntoDB = async (payload: IUser) => {
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

const refreshToken = async (token: string) => {
  // checking if the given token is valid

  let decoded;
  try {
    decoded = verifyToken(token, config.jwt_refresh_secret as StringValue);
    // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
  } catch (err) {
    throw new AppError(HTTP_STATUS.UNAUTHORIZED, 'Invalid Refresh Token');
  }

  const { email } = decoded;

  // checking if the user is exist
  const user = await User.findOne({ email });

  if (!user) {
    throw new AppError(HTTP_STATUS.NOT_FOUND, 'This user is not found !');
  }

  const jwtPayload = {
    userId: user._id,
    email: user.email,
    role: user.role,
    accountStatus: user.accountStatus,
  };

  const accessToken = createToken(
    jwtPayload,
    config.jwt_access_secret as StringValue,
    config.jwt_access_expires_in as StringValue,
  );

  return {
    accessToken,
  };
};

const changePasswordIntoDB = async (
  userData: JwtPayload,
  payload: { oldPassword: string; newPassword: string },
) => {
  // checking if the user is exist
  const user = await User.isUserExistsByEmail(userData.email);

  if (!user) {
    throw new AppError(HTTP_STATUS.NOT_FOUND, 'This user is not found !');
  }
  // checking if the user is already deleted

  const deletedAt = user?.deletedAt;

  if (deletedAt) {
    throw new AppError(HTTP_STATUS.FORBIDDEN, 'This user is deleted !');
  }

  // checking if the user is Suspend or suspended spam

  const userStatus = user?.accountStatus;

  if (
    userStatus === USER_STATUS.SUSPENDED ||
    userStatus === USER_STATUS.INACTIVE
  ) {
    throw new AppError(HTTP_STATUS.FORBIDDEN, `This user is ${userStatus} !!`);
  }

  //checking if the password is correct

  if (!(await User.isPasswordMatched(payload.oldPassword, user?.password)))
    throw new AppError(HTTP_STATUS.FORBIDDEN, 'Password do not matched');

  //hash new password
  const newHashedPassword = await bcrypt.hash(
    payload.newPassword,
    Number(config.bcrypt_salt_rounds),
  );

  await User.findOneAndUpdate(
    {
      email: userData?.email,
      role: userData?.role,
    },
    {
      password: newHashedPassword,
      needsPasswordChange: false,
      passwordChangedAt: new Date(),
    },
  );

  return null;
};

/**
 * @desc   Handles the forgot password process by verifying the user’s status,
 *         generating a password reset token, and sending a reset link via email.
 * @param  {string} userEmail - The email address of the user who requested a password reset.
 * @returns {Promise<void>} Returns nothing, sends an email with the reset link if successful.
 */
const forgetPassword = async (userEmail: string) => {
  // Check if the user exists by email
  const user = await User.isUserExistsByEmail(userEmail);

  if (!user) {
    throw new AppError(HTTP_STATUS.NOT_FOUND, 'This user is not found !');
  }

  // Check if the user is marked as deleted
  const deletedAt = user?.deletedAt;
  if (deletedAt) {
    throw new AppError(HTTP_STATUS.FORBIDDEN, 'This user is deleted !');
  }

  // Check if the user’s account is blocked or suspended
  const userStatus = user?.accountStatus;
  if (
    userStatus === USER_STATUS.SUSPENDED ||
    userStatus === USER_STATUS.INACTIVE
  ) {
    throw new AppError(HTTP_STATUS.FORBIDDEN, `This user is ${userStatus} !!`);
  }

  // Prepare the payload for the reset token
  const jwtPayload = {
    userId: user?._id,
    username: user.username,
    email: user?.email,
    role: user?.role,
  };

  // Create a JWT reset token valid for 10 minutes
  const resetToken = createToken(
    jwtPayload,
    config.jwt_access_secret as string,
    '10m',
  );

  // Construct the reset password UI link containing the token
  const resetUILink = `${config.reset_pass_ui_link}/reset-password?email=${user.email}&token=${resetToken}`;

  // Prepare email content for password reset
  const subject = 'Reset Your Password';
  const text = `Hi ${user.username},\n\nClick the link below to reset your password:\n${resetUILink}`;
  const html = `
    <h1>Password Reset Request</h1>
    <p>Hello, ${user.username}!</p>
    <p>Click the button below to reset your password:</p>
    <a href="${resetUILink}" style="padding: 10px 15px; background-color: #007BFF; color: #fff; text-decoration: none; border-radius: 5px;">
      Reset Password
    </a>
    <p>If you didn’t request this, you can safely ignore this email.</p>
  `;

  // Send the reset password email to the user
  await sendEmail({
    to: user.email,
    subject,
    text,
    html,
  });
};

/**
 * @desc   Resets the user's password by verifying their account status, checking the reset token,
 *         and updating the password in the database.
 * @param  {Object} payload - The request payload containing the email and the new password.
 * @param  {string} token - The reset token used for verification.
 * @returns {Promise<void>} Returns nothing, but updates the user's password if successful.
 */
const resetPassword = async (
  payload: { email: string; newPassword: string },
  token: string,
) => {
  // Check if the user exists by their email
  const user = await User.isUserExistsByEmail(payload?.email);

  if (!user) {
    throw new AppError(HTTP_STATUS.NOT_FOUND, 'This user is not found !');
  }

  // Check if the user has been deleted
  const deletedAt = user?.deletedAt;

  if (deletedAt) {
    throw new AppError(HTTP_STATUS.FORBIDDEN, 'This user is deleted !');
  }

  // Check if the user’s account is blocked or suspended
  const userStatus = user?.accountStatus;
  if (
    userStatus === USER_STATUS.SUSPENDED ||
    userStatus === USER_STATUS.INACTIVE
  ) {
    throw new AppError(HTTP_STATUS.FORBIDDEN, `This user is ${userStatus} !!`);
  }

  // Decode and verify the reset token
  const decoded = jwt.verify(
    token,
    config.jwt_access_secret as string,
  ) as JwtPayload;

  // Ensure that the email in the token matches the email in the payload
  if (payload.email !== decoded.email) {
    throw new AppError(HTTP_STATUS.FORBIDDEN, 'You are forbidden!');
  }

  // Hash the new password before saving it to the database
  const newHashedPassword = await bcrypt.hash(
    payload.newPassword,
    Number(config.bcrypt_salt_rounds),
  );

  // Update the user's password and reset related fields
  await User.findOneAndUpdate(
    {
      email: decoded.email,
      role: decoded.role,
    },
    {
      password: newHashedPassword,
      needsPasswordChange: false,
      passwordChangedAt: new Date(),
    },
  );
};

/**
 * @desc   Validates the provided refresh token, checks if the user exists, and returns a response indicating the validity of the user.
 * @param  {string} token - The refresh token to be validated.
 * @returns {Promise<{ validUser: boolean }>} Returns an object with the `validUser` flag indicating if the user is valid.
 * @throws {AppError} Throws an error if the token is invalid, expired, or if the user is not found.
 */
export const logOutToken = async (
  token: string,
): Promise<{ validUser: boolean }> => {
  let decoded;

  try {
    // Verify and decode the provided refresh token
    decoded = verifyToken(token, config.jwt_refresh_secret as StringValue);
    // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
  } catch (err) {
    // If token verification fails, throw an error indicating the token is invalid or expired
    throw new AppError(
      HTTP_STATUS.UNAUTHORIZED,
      'Invalid or expired refresh token',
    );
  }

  // Check if the decoded token contains a valid email
  if (!decoded?.email) {
    throw new AppError(HTTP_STATUS.UNAUTHORIZED, 'Invalid token payload');
  }

  // Find the user associated with the decoded email
  const user = await User.findOne({ email: decoded.email });

  // If user not found, throw an error
  if (!user) {
    throw new AppError(HTTP_STATUS.NOT_FOUND, 'User not found');
  }

  // Return a response indicating the user is valid
  return {
    validUser: true,
  };
};

const accountStatusChangeIntoDB = async (
  userId: string,
  accountStatus: string,
) => {
  const result = await User.findOneAndUpdate(
    { _id: userId, deletedAt: null },
    {
      accountStatus,
    },
    { new: true },
  );

  return result;
};

export const authService = {
  loginUserIntoDB,
  registerUserIntoDB,
  refreshToken,
  changePasswordIntoDB,
  forgetPassword,
  resetPassword,
  logOutToken,
  accountStatusChangeIntoDB,
};
