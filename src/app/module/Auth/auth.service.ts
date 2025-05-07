import config from '../../config';
import { AppError } from '../../errors/error';
import { ILoginUser, IUser } from './auth.interface';
import User from './auth.model';
import httpStatus from 'http-status';
import { createToken } from './auth.utils';

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

  if (userStatus === 'suspended' || userStatus === 'suspended&spam') {
    throw new AppError(httpStatus.FORBIDDEN, `This user is ${userStatus} !`);
  }

  //checking if the password is correct
  console.log({
    userLoginPassword: payload?.password,
    userDbPassword: user?.password,
  });

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
    config.jwt_access_secret as string,
    config.jwt_access_expires_in as string,
  );

  const refreshToken = createToken(
    jwtPayload,
    config.jwt_refresh_secret as string,
    config.jwt_refresh_expires_in as string,
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
    config.jwt_access_secret as string,
    config.jwt_access_expires_in as string,
  );

  const refreshToken = createToken(
    jwtPayload,
    config.jwt_refresh_secret as string,
    config.jwt_refresh_expires_in as string,
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
