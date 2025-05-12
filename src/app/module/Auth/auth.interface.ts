import { Model } from 'mongoose';
import { PhoneVerificationStatus, UserStatus } from './auth.constant';
import { UserRole } from '../../constant';
import { IUserProfile } from '../User/user.interface';

export interface ILoginUser {
  email: string;
  password: string;
}

export interface IUser {
  _id?: string;
  username: string;
  email: string;
  role: UserRole;
  password: string;
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
