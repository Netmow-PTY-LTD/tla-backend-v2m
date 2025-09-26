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

const getStaffList = async (userId: string) => {
  return StaffProfile.find({ userId: { $ne: userId }, })
    .populate("userId")
    .populate('createdBy', 'email role')
    .sort({ createdAt: -1 });
};


const getStaffById = async (staffId: string) => {

  const existingUser = await FirmUser.isUserExists(staffId);
  if (existingUser) {
    return sendNotFoundResponse('User not found')
  }

  return StaffProfile.findOne({
    userId: new Types.ObjectId(staffId),

  });

};




const updateStaff = async (staffId: string, payload: any) => {

  const firmUser = await FirmUser.findById(staffId).select("+password");
  if (!firmUser) {
    throw new AppError(HTTP_STATUS.NOT_FOUND, " User not found");
  }

  const staffProfile = await StaffProfile.findOne({ userId: staffId }).populate("userId");
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
    { _id: staffId },
    { $set: profilePayload },
    { new: true }
  );

  if (!updatedProfile) {
    throw new AppError(
      HTTP_STATUS.NOT_FOUND,
      "Staff profile not found or unauthorized."
    );
  }

  return {
    staffProfile: updatedProfile,
    user: firmUser,
  };
};




const deleteStaff = async (userId: string, staffId: string) => {
  const deleted = await StaffProfile.findOneAndDelete({
    _id: staffId,
    createdBy: userId,
  });

  if (!deleted) {
    throw new AppError(
      HTTP_STATUS.NOT_FOUND,
      'Staff not found or unauthorized.',
    );
  }

  return deleted;
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
