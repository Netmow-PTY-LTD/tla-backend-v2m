/* eslint-disable no-unused-vars */
import { Model } from 'mongoose';
import { PhoneVerificationStatus, UserStatus } from '../constant/auth.constant';
import { TUserRole } from '../../../constant';
import { IUserProfile } from '../../User/interfaces/user.interface';

export interface ILoginUser {
  email: string;
  password: string;
}

export interface IUser {
  _id?: string;
  username: string;
  email: string;
  role: TUserRole;
  password: string;
  needsPasswordChange: boolean;
  passwordChangedAt?: Date;
  verifyCode?: string;
  verifyToken?: string;
  phoneNo?: string;
  isPhoneVerified: PhoneVerificationStatus;
  accountStatus: UserStatus;
  googleId?: string;
  isVerifiedAccount: boolean;
  resetPasswordToken?: string;
  resetPasswordExpires?: string;
  deletedAt?: Date | null;
  isDeleted: boolean;
  profile: IUserProfile;
}

export interface UserModel extends Model<IUser> {
  isUserExists(id: string): Promise<IUser>;

  isUserExistsByEmail(email: string): Promise<IUser>;

  isPasswordMatched(
    plainTextPassword: string,
    hashedPassword: string,
  ): Promise<boolean>;

  isJWTIssuedBeforePasswordChanged(
    passwordChangedTimestamp: Date,
    jwtIssuedTimestamp: number,
  ): boolean;
}
