import { AppError } from '../../errors/error';
import { ILoginUser, IUser } from './auth.interface';
import User from './auth.model';
import httpStatus from 'http-status';

const loginUserIntoDB = async (payload: ILoginUser) => {};

const registerUserIntoDB = async (payload: IUser) => {
  // checking if the user is exist
  const user = await User.isUserExistsByEmail(payload?.email);
  if (user) {
    throw new AppError(httpStatus.NOT_FOUND, 'This user is already exist!');
  }

  //create new user
  const newUser = await User.create(payload);

  return newUser;
};

export const authService = {
  loginUserIntoDB,
  registerUserIntoDB,
};
