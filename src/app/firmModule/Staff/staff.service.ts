import mongoose, { Types } from 'mongoose';

import { AppError } from '../../errors/error';
import { HTTP_STATUS } from '../../constant/httpStatus';
import StaffProfile, { IStaffProfile } from './staff.model';
import { createToken } from '../../module/Auth/auth.utils';
import { StringValue } from 'ms';
import config from '../../config';
import FirmUser from '../FirmAuth/frimAuth.model';
import { Firm_USER_ROLE } from '../FirmAuth/frimAuth.constant';

const getStaffList = async (firmId: string) => {
  return StaffProfile.find({ createdBy: new Types.ObjectId(firmId) })
    .populate('createdBy', 'email role')
    .sort({ createdAt: -1 });
};

const getStaffById = async (firmId: string, staffId: string) => {
  return StaffProfile.findOne({
    _id: new Types.ObjectId(staffId),
    createdBy: new Types.ObjectId(firmId),
  });
};

const updateStaff = async (firmId: string, staffId: string, payload: any) => {
  const updated = await StaffProfile.findOneAndUpdate(
    { _id: staffId, createdBy: firmId },
    { $set: payload },
    { new: true },
  );

  if (!updated) {
    throw new AppError(
      HTTP_STATUS.NOT_FOUND,
      'Staff not found or unauthorized.',
    );
  }
  return updated;
};

const deleteStaff = async (firmId: string, staffId: string) => {
  const deleted = await StaffProfile.findOneAndDelete({
    _id: staffId,
    createdBy: firmId,
  });

  if (!deleted) {
    throw new AppError(
      HTTP_STATUS.NOT_FOUND,
      'Staff not found or unauthorized.',
    );
  }

  return deleted;
};

const createStaff = async (firmId: string, payload: Partial<IStaffProfile>) => {
  if (!mongoose.Types.ObjectId.isValid(firmId)) {
    throw new AppError(HTTP_STATUS.BAD_REQUEST, 'Invalid firm ID.');
  }

  try {
    const newStaff = await StaffProfile.create({
      createdBy: firmId,
      ...payload,
    });

    return newStaff;
  } catch (err) {
    throw new AppError(
      HTTP_STATUS.EXPECTATION_FAILED,
      'Failed to create staff profile.',
    );
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
  permissions?: Types.ObjectId[]; // optional
  role?: string;
  status?: "active" | "inactive"; // optional
}

export const createStaffUserIntoDB = async (firmId: string, payload: StaffRegisterPayload) => {
  const session = await mongoose.startSession();
  session.startTransaction();

console.log('check payload ==>',payload)

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
          fullName,
          designation,
          phone,
          permissions: permissions || [],
          role,
          status,
          createdBy: firmId,
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
      accessToken,
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
  createStaff,
  createStaffUserIntoDB
};
