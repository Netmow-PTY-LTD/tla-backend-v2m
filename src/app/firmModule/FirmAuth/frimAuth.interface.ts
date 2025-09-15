// ===============================
// Interfaces
// ===============================

import { Model } from "mongoose";
import { FirmUserRole, FirmUserStatus } from "./frimAuth.constant";


// Single user document
export interface IFirmUser extends Document {
  email: string;
  role: FirmUserRole;
  regUserType?: string;
  regType?: string;
  password: string;
  needsPasswordChange: boolean;
  passwordChangedAt?: Date;
  isPhoneVerified: boolean;
  phoneNo?: string;
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
