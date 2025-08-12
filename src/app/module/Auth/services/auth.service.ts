import config from '../../../config';
import { AppError } from '../../../errors/error';
import { ILoginUser } from '../interfaces/auth.interface';
import User from '../models/auth.model';
import { createToken, verifyToken } from '../utils/auth.utils';
import { USER_STATUS } from '../constant/auth.constant';
import { StringValue } from 'ms';
import { HTTP_STATUS } from '../../../constant/httpStatus';
import bcrypt from 'bcryptjs';
import jwt, { JwtPayload } from 'jsonwebtoken';

import UserProfile from '../../User/models/user.model';

import { sendEmail } from '../../../emails/email.service';

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
    // username: user.username,
    regUserType: user?.regUserType,
    email: user?.email,
    role: user?.role,
    accountStatus: user.accountStatus,
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
//  * @param  {IUser} payload - The user registration data.
 * @returns  An object containing the access token, refresh token, and user data.
 */





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
    regUserType:user.regUserType,
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
 * @returns  Returns nothing, sends an email with the reset link if successful.
 */
const forgetPassword = async (userEmail: string) => {
  // Check if the user exists by email
  const user = await User.isUserExistsByEmail(userEmail);

  if (!user) {
    throw new AppError(HTTP_STATUS.NOT_FOUND, 'This user is not found !');
  }
  const userProfile = await UserProfile.findOne({ user: user._id });

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
    // username: user.username,
    email: user?.email,
    role: user?.role,
    regUserType:user?.regUserType,
       accountStatus: user.accountStatus,
  };

  // Create a JWT reset token valid for 10 minutes
  const resetToken = createToken(
    jwtPayload,
    config.jwt_access_secret as string,
    '10m',  // for short time reset password
  );

  // Construct the reset password UI link containing the token
  const resetUILink = `${config.client_url}/reset-password?email=${user.email}&token=${resetToken}`;

  // Prepare email content for password reset
  const restEmailData = {
    name: userProfile?.name,
    resetUrl: resetUILink

  };
  await sendEmail({
    to: user.email,
    subject: 'Reset Your Password to Regain Access',
    data: restEmailData,
    emailTemplate: 'password_reset',
  });

};

/**
 * @desc   Resets the user's password by verifying their account status, checking the reset token,
 *         and updating the password in the database.
 * @param  {Object} payload - The request payload containing the email and the new password.
 * @param  {string} token - The reset token used for verification.
 * 
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




const verifyEmailService = async (code: string): Promise<string> => {

  if (!code) throw new AppError(400, 'Missing code');
  const decoded = jwt.verify(code, config.jwt_access_secret as StringValue) as JwtPayload;

  const user = await User.findById(decoded.userId);
  if (!user) throw new AppError(404, 'User not found');

  if (user.isVerifiedAccount) {
    return 'Already verified';
  }
  user.isVerifiedAccount = true;
  user.verifyToken = ''; // Optional cleanup
  await user.save();

  return 'Email verified successfully';
};



const resendVerificationEmail = async (email: string) => {
  if (!email) {
    throw new AppError(HTTP_STATUS.BAD_REQUEST, 'Email is required');
  }

  const user = await User.findOne({ email }).populate('profile');
  if (!user) {
    throw new AppError(HTTP_STATUS.NOT_FOUND, 'User not found');
  }

  if (user.isVerifiedAccount) {
    throw new AppError(HTTP_STATUS.CONFLICT, 'Email is already verified');
  }

  // Clear existing code
  user.verifyToken = '';
  await user.save();

  // Generate new code
  const jwtPayload = {
    userId: user._id,
    email: user.email,
    role: user.role,
    regUserType:user.regUserType,
    accountStatus: user.accountStatus,
  };

  const accessToken = createToken(
    jwtPayload,
    config.jwt_access_secret as StringValue,
    config.jwt_access_expires_in as StringValue,
  );

  // Save code for verification
  user.verifyToken = accessToken;
  await user.save();

  // Prepare email
  const emailVerificationUrl = `${config.client_url}/verify-email?code=${accessToken}`;
  await sendEmail({
    to: user.email,
    subject: 'Verify your account – TheLawApp',
    data: {
      name: (user?.profile as any)?.name,
      verifyUrl: emailVerificationUrl,
      role: user.role,
    },
    emailTemplate: 'verify_email',
  });

  return { email: user.email, isVerified: user.isVerifiedAccount };
};


















export const authService = {
  loginUserIntoDB,
  refreshToken,
  changePasswordIntoDB,
  forgetPassword,
  resetPassword,
  logOutToken,
  accountStatusChangeIntoDB,
  verifyEmailService,
  resendVerificationEmail
};
