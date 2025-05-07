import { Model, Types } from 'mongoose';
import {
  PhoneVerificationStatus,
  UserProfile,
  UserStatus,
} from './auth.constant';

export interface ILoginUser {
  email: string;
  password: string;
}

export interface IUser {
  _id?: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  password: string;
  activeProfile: UserProfile;
  country: Types.ObjectId;
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
}

export interface UserModel extends Model<IUser> {
  // eslint-disable-next-line no-unused-vars
  isUserExists(id: string): Promise<IUser>;
  // eslint-disable-next-line no-unused-vars
  isUserExistsByEmail(email: string): Promise<IUser>;

  isPasswordMatched(
    // eslint-disable-next-line no-unused-vars
    plainTextPassword: string,
    // eslint-disable-next-line no-unused-vars
    hashedPassword: string,
  ): Promise<boolean>;
}
