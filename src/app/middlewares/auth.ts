import { NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status';
import jwt, { JwtPayload } from 'jsonwebtoken';
import config from '../config';
import catchAsync from '../utils/catchAsync';
import { AppError } from '../errors/error';
import User from '../module/Auth/auth.model';
import { USER_STATUS } from '../module/Auth/auth.constant';
import { HTTP_STATUS } from '../constant/httpStatus';
import { TUserRole } from '../constant';

const auth = (...requiredRoles: TUserRole[]) => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization;

    // checking if the token is missing
    if (!token) {
      throw new AppError(httpStatus.UNAUTHORIZED, 'You are not authorized!');
    }

    // checking if the given token is valid
    //  token invalid then check this code errror
    let decoded;
    try {
      decoded = jwt.verify(
        token,
        config.jwt_access_secret as string,
      ) as JwtPayload;
      // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
    } catch (err) {
      throw new AppError(httpStatus.UNAUTHORIZED, 'Unauthorized');
    }

    const { role, email, iat } = decoded;

    // checking if the user is exist
    const user = await User.isUserExistsByEmail(email);

    if (!user) {
      throw new AppError(httpStatus.NOT_FOUND, 'This user is not found !');
    }
    // checking if the user is already deleted

    const deletedAt = user?.deletedAt;

    if (deletedAt) {
      throw new AppError(httpStatus.FORBIDDEN, 'This user is deleted !');
    }

    // checking if the user is blocked
    const userStatus = user?.accountStatus;

    if (
       userStatus === USER_STATUS.SUSPENDED ||
    userStatus === USER_STATUS.ARCHIVED || userStatus === USER_STATUS.REJECTED
    ) {
      throw new AppError(
        HTTP_STATUS.FORBIDDEN,
        `This user is ${userStatus} !!`,
      );
    }

    if (
      user.passwordChangedAt &&
      User.isJWTIssuedBeforePasswordChanged(
        user.passwordChangedAt,
        iat as number,
      )
    ) {
      throw new AppError(httpStatus.UNAUTHORIZED, 'You are not authorized !');
    }

    if (requiredRoles && !requiredRoles.includes(role)) {
      throw new AppError(
        httpStatus.UNAUTHORIZED,
        'You are not authorized  hi!',
      );
    }

    req.user = decoded as JwtPayload & { role: string };
    next();
  });
};

export default auth;
