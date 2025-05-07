import { Model, Types } from 'mongoose';

export interface ILoginUser {
  email: string;
  password: string;
}

export interface IUser {
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  password: string;
  activeProfile: 'basic' | 'premium' | 'admin';
  country: Types.ObjectId;
  verifyCode?: string;
  verifyToken?: string;
  phoneNo?: string;
  isPhoneVerified: 'yes' | 'no';
  accountStatus: 'active' | 'suspended' | 'banned';
  googleId?: string;
  isVerifiedAccount: boolean;
  resetPasswordToken?: string;
  resetPasswordExpires?: string;
  deletedAt?: Date | null;
  isDelete: boolean;
}

export interface UserModel extends Model<IUser> {
  // eslint-disable-next-line no-unused-vars
  isUserExists(id: string): Promise<IUser>;
  // eslint-disable-next-line no-unused-vars
  isUserExistsByEmail(email: string): Promise<IUser>;
}
