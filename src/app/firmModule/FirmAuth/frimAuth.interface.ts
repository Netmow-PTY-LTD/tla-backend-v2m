// ===============================
// Interfaces
// ===============================

import { Model, Types } from "mongoose";
import { FirmUserRole, FirmUserStatus } from "./frimAuth.constant";

export interface IFirmLoginUser {
  email: string;
  password: string;
}

// Single user document
export interface IFirmUser extends Document {
  _id: any;
  name: string;
  email: string;
  role: FirmUserRole;
  password: string;
  needsPasswordChange: boolean;
  passwordChangedAt?: Date;
  isPhoneVerified: boolean;
  phone?: string;
  verifyCode?: string;
  verifyToken?: string;
  isVerifiedAccount: boolean;
  googleId?: string;
  resetPasswordToken?: string;
  resetPasswordExpires?: string;
  accountStatus: FirmUserStatus;
  isOnline: boolean;
  lastSeen?: Date | null;
  deletedAt?: Date | null;
  pendingEmail?: string;
  emailChangeToken?: string;
  emailChangeTokenExpires?: Date;
  firmProfileId: Types.ObjectId;
  profile: Types.ObjectId;
  // fullName: string;
  // designation: string;
  // image: string;
}

// Static methods for the model
export interface FirmUserModel extends Model<IFirmUser> {
  isPasswordMatched(
    plainTextPassword: string,
    hashedPassword: string
  ): Promise<boolean>;

  isUserExists(id: string): Promise<IFirmUser | null>;

  isUserExistsByEmail(email: string): Promise<IFirmUser | null>;

  isJWTIssuedBeforePasswordChanged(
    passwordChangedTimestamp: Date,
    jwtIssuedTimestamp: number
  ): boolean;
}
