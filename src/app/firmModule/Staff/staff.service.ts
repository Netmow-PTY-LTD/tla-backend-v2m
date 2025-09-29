import mongoose, { Types } from 'mongoose';
import { AppError } from '../../errors/error';
import { HTTP_STATUS } from '../../constant/httpStatus';
import { createToken } from '../../module/Auth/auth.utils';
import { StringValue } from 'ms';
import config from '../../config';
import FirmUser from '../FirmAuth/frimAuth.model';
import { Firm_USER_ROLE } from '../FirmAuth/frimAuth.constant';
import { sendNotFoundResponse } from '../../errors/custom.error';
import StaffProfile from './staff.model';


export const getStaffList = async (userId: string) => {
  try {
    // 1️ Find requesting user
    const user = await FirmUser.findById(userId).select('firmProfileId role');
    if (!user) {
      return sendNotFoundResponse("User not found");
    }

    // 2️ Build filter
    const filter: Record<string, any> = {
      userId: { $ne: userId }, // exclude self
    };

    // 3️ Determine firmProfileId for filtering
    if (user.firmProfileId) {
      filter.firmProfileId = user.firmProfileId;
    }

    // 4️ Fetch staff list
    const staffList = await StaffProfile.find(filter)
      .populate({
        path: 'userId',
        select: 'email fullName role',
      })
      .populate({
        path: 'createdBy',
        select: 'email role',
      })
      .sort({ createdAt: -1 })
      .lean();

    return staffList;
  } catch (error) {
    throw error; // Let your controller or middleware handle the response
  }
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

  const user = await FirmUser.findById(staffUserId).select("+password");
  if (!user) {
    throw new AppError(HTTP_STATUS.NOT_FOUND, " User not found");
  }

  const staffProfile = await StaffProfile.findOne({ userId: staffUserId }).populate("userId");
  if (!staffProfile) {
    throw new AppError(HTTP_STATUS.NOT_FOUND, "Staff not found");
  }

  if (payload.email) {
    user.email = payload.email;
  }

  if (payload.password) {
    user.password = payload.password; // will be auto-hashed by pre-save hook
    user.needsPasswordChange = true; // optional: force user to login again
    user.passwordChangedAt = new Date();
  }

  await user.save();

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
    user,
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



interface StaffRegisterPayload {
  email: string;
  password: string;
  fullName: string;
  role?: string; // optional, default to STAFF

}


interface StaffRegisterPayload {
  email: string;
  password: string;
  fullName: string;
  designation?: string;
  phone?: string;
  firmProfileId: Types.ObjectId; // optional
  permissions?: Types.ObjectId[]; // optional
  role?: string;
  image?: string;
  status: "active" | "inactive"; // optional
}

const createStaffUserIntoDB = async (userId: string, payload: StaffRegisterPayload) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const {
      email,
      password,
      fullName,
      firmProfileId,
      designation,
      phone,
      permissions,
      role = Firm_USER_ROLE.STAFF,
      image,
      status
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
          // permissions: permissions || [],
          accountStatus: status
        },
      ],
      { session }
    );

    // 3️⃣ Create corresponding StaffProfile
    const [newProfile] = await StaffProfile.create(
      [
        {
          userId: newUser._id,
          firmProfileId: new mongoose.Types.ObjectId(firmProfileId),
          fullName,
          designation,
          phone,
          role,
          image,
          createdBy: new mongoose.Types.ObjectId(userId)
        },
      ],
      { session }
    );

    newUser.firmProfileId = firmProfileId as Types.ObjectId
    newUser.profile = newProfile._id as Types.ObjectId
    await newUser.save({ session });


    // 5️⃣ Generate JWT token
    const jwtPayload = {
      userId: newUser._id,
      email: newUser.email,
      role: newUser.role,
      accountStatus: newUser.accountStatus,
      firmProfileId
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
