import config from '../../config';
import { AppError } from '../../errors/error';
import { ILoginUser, IUser } from './auth.interface';
import User from './auth.model';
import httpStatus from 'http-status';
import { createToken } from './auth.utils';
import { USER_STATUS } from './auth.constant';
import { StringValue } from 'ms';

const loginUserIntoDB = async (payload: ILoginUser) => {
  // checking if the user is exist
  const user = await User.isUserExistsByEmail(payload?.email);

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'This user is not found !');
  }
  // checking if the user is already deleted

  const isDeleted = user?.isDeleted;

  if (isDeleted) {
    throw new AppError(httpStatus.FORBIDDEN, 'This user is deleted !');
  }

  // checking if the user is blocked

  const userStatus = user?.accountStatus;

  if (
    userStatus === USER_STATUS.SUSPENDED ||
    userStatus === USER_STATUS.SUSPENDED_SPAM
  ) {
    throw new AppError(httpStatus.FORBIDDEN, `This user is ${userStatus} !`);
  }

  if (!(await User.isPasswordMatched(payload?.password, user?.password)))
    throw new AppError(httpStatus.FORBIDDEN, 'Password do not matched');

  //create token and sent to the  client

  const jwtPayload = {
    userId: user?._id,
    name: `${user.firstName} ${user.lastName}`.trim(),
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

  return {
    accessToken,
    refreshToken,
  };
};

const registerUserIntoDB = async (payload: IUser) => {
  // checking if the user is exist
  const user = await User.isUserExistsByEmail(payload?.email);
  if (user) {
    throw new AppError(httpStatus.NOT_FOUND, 'This user is already exist!');
  }

  //create new user
  const newUser = await User.create(payload);

  //create token and sent to the  client
  const jwtPayload = {
    userId: newUser?._id,
    name: `${newUser.firstName} ${newUser.lastName}`.trim(),
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

  return {
    accessToken,
    refreshToken,
  };
};

export const authService = {
  loginUserIntoDB,
  registerUserIntoDB,
};
