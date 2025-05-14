/* eslint-disable no-unused-vars */
import { Model, Types } from 'mongoose';
import { PhoneVerificationStatus, UserStatus } from '../constant/auth.constant';
import { TUserRole } from '../../../constant';

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
  regUserType: string;
  regType?: string;
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
  profile: Types.ObjectId;
}

export interface UserModel extends Model<IUser> {
  /**
   * Method to check if a user exists by ID
   * @param {string} id - The ID of the user to check
   * @returns {Promise<IUser>} - The user object if found
   */
  isUserExists(id: string): Promise<IUser>;

  /**
   * Method to check if a user exists by email
   * @param {string} email - The email of the user to check
   * @returns {Promise<IUser>} - The user object if found
   */

  isUserExistsByEmail(email: string): Promise<IUser>;

  /**
   * Method to compare plain-text password with hashed password
   * @param {string} plainTextPassword - The plain-text password entered by the user
   * @param {string} hashedPassword - The hashed password stored in the database
   * @returns {Promise<boolean>} - Returns true if passwords match, false otherwise
   */

  isPasswordMatched(
    plainTextPassword: string,
    hashedPassword: string,
  ): Promise<boolean>;

  /**
   * Method to check if a JWT was issued before the password was changed
   * @param {Date} passwordChangedTimestamp - The timestamp of the last password change
   * @param {number} jwtIssuedTimestamp - The timestamp when the JWT was issued
   * @returns {boolean} - Returns true if the JWT was issued before the password change, false otherwise
   */
  isJWTIssuedBeforePasswordChanged(
    passwordChangedTimestamp: Date,
    jwtIssuedTimestamp: number,
  ): boolean;
}
