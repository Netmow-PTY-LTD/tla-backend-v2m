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
  // checking if the user is exist
  const user = await User.isUserExistsByEmail(payload?.email);
  if (user) {
    throw new AppError(HTTP_STATUS.NOT_FOUND, 'This user is already exist!');
  }

  //create new user
  const newUser = await User.create(payload);

  //create token and sent to the  client
  const jwtPayload = {
    userId: newUser?._id,
    email: newUser?.email,
    role: newUser?.role,
    status: newUser?.accountStatus,
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
