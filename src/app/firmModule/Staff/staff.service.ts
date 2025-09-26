import mongoose, { Types } from 'mongoose';

import { AppError } from '../../errors/error';
import { HTTP_STATUS } from '../../constant/httpStatus';
import StaffProfile, { IStaffProfile } from './staff.model';
import { createToken } from '../../module/Auth/auth.utils';
import { StringValue } from 'ms';
import config from '../../config';
import FirmUser from '../FirmAuth/frimAuth.model';
import { Firm_USER_ROLE } from '../FirmAuth/frimAuth.constant';
import { sendNotFoundResponse } from '../../errors/custom.error';

const getStaffList = async (userId: string, query: Record<string, any>) => {

  const { firmId } = query;

  // Build base filter
  const filter: Record<string, any> = {
    userId: { $ne: userId },
  };

  // If firmId exists in query, add it to filter
  if (firmId) {
    filter.firmId = firmId;
  }

  return StaffProfile.find(filter)
    .populate("userId")
    .populate('createdBy', 'email role')
    .sort({ createdAt: -1 });
};


const getStaffById = async (staffUserId: string) => {



  const existingUser = await FirmUser.isUserExists(staffUserId);
  if (!existingUser) {
    return sendNotFoundResponse('User not found')
  }

  return StaffProfile.findOne({
    userId: new Types.ObjectId(staffUserId),

  }).populate("userId");

};



const updateStaff = async (userId: string, staffUserId: string, payload: any) => {

  const firmUser = await FirmUser.findById(staffUserId).select("+password");
  if (!firmUser) {
    throw new AppError(HTTP_STATUS.NOT_FOUND, " User not found");
  }

  const staffProfile = await StaffProfile.findOne({ userId: staffUserId }).populate("userId");
  if (!staffProfile) {
    throw new AppError(HTTP_STATUS.NOT_FOUND, "Staff not found");
  }

  if (payload.email) {
    firmUser.email = payload.email;
  }

  if (payload.password) {
    firmUser.password = payload.password; // will be auto-hashed by pre-save hook
    firmUser.needsPasswordChange = true; // optional: force user to login again
    firmUser.passwordChangedAt = new Date();
  }

  await firmUser.save();

  // 3️ Remove fields meant for FirmUser from StaffProfile update payload
  const { email, password, ...profilePayload } = payload;

  // 4️ Update StaffProfile fields
  const updatedProfile = await StaffProfile.findOneAndUpdate(
    { _id: staffProfile?._id },
    {
      $set: {
        ...profilePayload,
        updatedBy: new Types.ObjectId(userId) // ensure ObjectId type
      }
    },
    { new: true }
  );

  if (!updatedProfile) {
    throw new AppError(
      HTTP_STATUS.NOT_FOUND,
      "Staff profile not found "
    );
  }

  return {
    staffProfile: updatedProfile,
    user: firmUser,
  };
};



const deleteStaff = async (staffUserId: string) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    // 1️⃣ Delete the firm user
    const user = await FirmUser.findByIdAndDelete(staffUserId, { session });
    if (!user) {
      throw new AppError(HTTP_STATUS.NOT_FOUND, "Firm user not found.");
    }

    // 2️⃣ Delete the staff profile linked to that user
    const deleted = await StaffProfile.findOneAndDelete(
      { userId: staffUserId },
      { session }
    );

    if (!deleted) {
      throw new AppError(HTTP_STATUS.NOT_FOUND, "Staff profile not found.");
    }

    // 3️⃣ Commit transaction (✅ both deleted)
    await session.commitTransaction();
    session.endSession();

    return { message: "Firm user and staff profile deleted successfully." };
  } catch (err) {
    // ❌ Rollback everything if any error occurs
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
};



export interface StaffRegisterPayload {
  email: string;
  password: string;
  fullName: string;
  role?: string; // optional, default to STAFF
}


export interface StaffRegisterPayload {
  email: string;
  password: string;
  fullName: string;
  designation?: string;
  phone?: string;
  firmId: Types.ObjectId; // optional
  permissions?: Types.ObjectId[]; // optional
  role?: string;
  status?: "active" | "inactive"; // optional
}

export const createStaffUserIntoDB = async (userId: string, payload: StaffRegisterPayload) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const {
      email,
      password,
      fullName,
      firmId,
      designation,
      phone,
      permissions,
      role = Firm_USER_ROLE.STAFF,
      status = "active",
    } = payload;

    // 1️⃣ Check if user already exists
    const existingUser = await FirmUser.isUserExistsByEmail(email);
    if (existingUser) {
      throw new AppError(
        HTTP_STATUS.CONFLICT,
        "Account already exists with this email. Please  use a new email."
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
          profileType: "StaffProfile",
        },
      ],
      { session }
    );

    // 3️⃣ Create corresponding StaffProfile
    const [newProfile] = await StaffProfile.create(
      [
        {
          userId: newUser._id,
          firmId: new mongoose.Types.ObjectId(firmId),
          fullName,
          designation,
          phone,
          permissions: permissions || [],
          role,
          status,
          createdBy: new mongoose.Types.ObjectId(userId)
        },
      ],
      { session }
    );

    // 4️⃣ Link profileId to user
    newUser.profileId = newProfile._id as Types.ObjectId;
    await newUser.save({ session });

    // 5️⃣ Generate JWT token
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

    newUser.verifyToken = accessToken;
    await newUser.save({ session });

    // 6️⃣ Commit transaction
    await session.commitTransaction();
    session.endSession();

    return {
      userData: newUser,
      profileData: newProfile,
    };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};


export const staffService = {
  getStaffList,
  getStaffById,
  updateStaff,
  deleteStaff,
  createStaffUserIntoDB
};
