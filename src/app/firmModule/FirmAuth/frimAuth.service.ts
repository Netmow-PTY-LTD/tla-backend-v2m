

import mongoose from "mongoose";
import { AppError } from "../../errors/error";
import config from "../../config";
import { createToken } from "../../module/Auth/auth.utils";
import { Firm_USER_ROLE } from "./frimAuth.constant";
import { FirmUser } from "./frimAuth.model";

import { StringValue } from "ms";
import { HTTP_STATUS } from "../../constant/httpStatus";
import { StaffProfile } from "../Staff/staff.model";

export interface StaffRegisterPayload {
  email: string;
  password: string;
  fullName: string;
  role?: string; // optional, default to STAFF
}

export const staffRegisterUserIntoDB = async (payload: StaffRegisterPayload) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { email, password, fullName, role = Firm_USER_ROLE.STAFF } = payload;

    // 1️⃣ Check if user already exists
    const existingUser = await FirmUser.isUserExistsByEmail(email);
    if (existingUser) {
      throw new AppError(
        HTTP_STATUS.CONFLICT,
        "Account already exists with this email. Please login or use a new email."
      );
    }

    // 2️⃣ Create new FirmUser
    const [newUser] = await FirmUser.create(
      [
        {
          email,
          password,
          role,
          regUserType: "staff",
        },
      ],
      { session }
    );

    // 3️⃣ Create corresponding StaffProfile linked to FirmUser
    const [newProfile] = await StaffProfile.create(
      [
        {
          fullName,
          createdBy: newUser._id, // link creator
        },
      ],
      { session }
    );

    // Optionally link StaffProfile back to FirmUser if needed
    // newUser.profileId = newProfile._id;
    // await newUser.save({ session });

    // 4️⃣ Generate JWTs
    const jwtPayload = {
      userId: newUser._id,
      email: newUser.email,
      role: newUser.role,
      accountStatus: newUser.accountStatus,
    };

    const accessToken = createToken(
      jwtPayload,
      config.jwt_access_secret as StringValue,
      config.jwt_access_expires_in as StringValue
    );

    const refreshToken = createToken(
      jwtPayload,
      config.jwt_refresh_secret as StringValue,
      config.jwt_refresh_expires_in as StringValue
    );

    // 5️⃣ Save access token for verification
    newUser.verifyToken = accessToken;
    await newUser.save({ session });

    // 6️⃣ Commit transaction
    await session.commitTransaction();
    session.endSession();

    return {
      accessToken,
      refreshToken,
      userData: newUser,
      profileData: newProfile,
    };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

// Export service
export const firmAuthService = {
  staffRegisterUserIntoDB,
};
