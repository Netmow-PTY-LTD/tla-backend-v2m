import config from '../../config';
import { AppError } from '../../errors/error';
import { ILoginUser, IUser } from './auth.interface';
import User from './auth.model';
import { createToken, verifyToken } from './auth.utils';
import { USER_STATUS } from './auth.constant';
import { StringValue } from 'ms';
import { HTTP_STATUS } from '../../constant/httpStatus';
import bcrypt from 'bcryptjs';
import { JwtPayload } from 'jsonwebtoken';
import mongoose from 'mongoose';
import UserProfile from '../User/user.model';

const loginUserIntoDB = async (payload: ILoginUser) => {
  // checking if the user is exist
  const user = await User.isUserExistsByEmail(payload?.email);

  if (!user) {
    throw new AppError(HTTP_STATUS.NOT_FOUND, 'This user is not found !');
  }
  // checking if the user is already deleted

  const isDeleted = user?.isDeleted;

  if (isDeleted) {
    throw new AppError(HTTP_STATUS.FORBIDDEN, 'This user is deleted !');
  }

  // checking if the user is blocked

  const userStatus = user?.accountStatus;

  if (
    userStatus === USER_STATUS.SUSPENDED ||
    userStatus === USER_STATUS.SUSPENDED_SPAM
  ) {
    throw new AppError(HTTP_STATUS.FORBIDDEN, `This user is ${userStatus} !`);
  }

  if (!(await User.isPasswordMatched(payload?.password, user?.password)))
    throw new AppError(HTTP_STATUS.FORBIDDEN, 'Password do not matched');

  //create token and sent to the  client

  const jwtPayload = {
    userId: user?._id,
    email: user?.email,
    role: user?.role,
    status: user?.accountStatus,
  };

  const accessToken = createToken(
    jwtPayload,
    config.jwt_access_secret as StringValue,
    config.jwt_access_expires_in as StringValue,
  );

  const refreshToken = createToken(
    jwtPayload,
    config.jwt_refresh_secret as StringValue,
    config.jwt_refresh_expires_in as StringValue,
  );

  const userData = await User.findOne({ email: payload.email });
  return {
    accessToken,
    refreshToken,
    userData,
  };
};

const registerUserIntoDB = async (payload: IUser) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Check if user already exists
    const existingUser = await User.isUserExistsByEmail(payload.email);
    if (existingUser) {
      throw new AppError(HTTP_STATUS.BAD_REQUEST, 'This user already exists!');
    }

    // Separate the profile part from user payload
    const { profile, ...userData } = payload;

    // Create the user
    const [newUser] = await User.create([userData], { session });

    // Prepare profile data with userId reference
    const profileData = {
      ...profile,
      user: newUser._id,
    };

    // Create user profile
    await UserProfile.create([profileData], { session });

    // Commit transaction
    await session.commitTransaction();
    session.endSession();

    // Generate tokens
    const jwtPayload = {
      userId: newUser._id,
      email: newUser.email,
      role: newUser.role,
      status: newUser.accountStatus,
    };

    const accessToken = createToken(
      jwtPayload,
      config.jwt_access_secret as StringValue,
      config.jwt_access_expires_in as StringValue,
    );

    const refreshToken = createToken(
      jwtPayload,
      config.jwt_refresh_secret as StringValue,
      config.jwt_refresh_expires_in as StringValue,
    );

    return {
      accessToken,
      refreshToken,
      userData: newUser,
    };
  } catch (error) {
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
    email: user.email,
    role: user.role,
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

  const isDeleted = user?.isDeleted;

  if (isDeleted) {
    throw new AppError(HTTP_STATUS.FORBIDDEN, 'This user is deleted !');
  }

  // checking if the user is Suspend or suspended spam

  const userStatus = user?.accountStatus;

  if (
    userStatus === USER_STATUS.SUSPENDED ||
    userStatus === USER_STATUS.SUSPENDED_SPAM
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

export const authService = {
  loginUserIntoDB,
  registerUserIntoDB,
  refreshToken,
  changePasswordIntoDB,
};
