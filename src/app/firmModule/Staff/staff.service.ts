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
import PageModel from '../../module/Pages/page.model';
import { TUploadedFile } from '../../interface/file.interface';
import { deleteFromSpace, uploadToSpaces } from '../../config/upload';
import { FOLDERS } from '../../constant';


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
        select: 'email  role accountStatus',
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




// const updateStaff = async (
//   userId: string,
//   staffUserId: string,
//   payload: any,
//   file: TUploadedFile
// ) => {
//   // 1️ Fetch FirmUser
//   const user = await FirmUser.findById(staffUserId).select("+password");
//   if (!user) {
//     throw new AppError(HTTP_STATUS.NOT_FOUND, "User not found");
//   }

//   // 2️ Fetch StaffProfile
//   const staffProfile = await StaffProfile.findOne({ userId: staffUserId }).populate("userId");
//   if (!staffProfile) {
//     throw new AppError(HTTP_STATUS.NOT_FOUND, "Staff profile not found");
//   }


//     //  Handle file upload
//     if (file?.buffer) {
//      const imageUrl = await uploadToSpaces(file.buffer, file.originalname, {
//         folder: FOLDERS.FIRMS,
//         entityId: `staff-${user.firmProfileId}`, // use firmProfileId directly
//         subFolder: FOLDERS.PROFILES
//       });

//       payload.image = imageUrl;
//     }



//   // 3️ Update FirmUser fields
//   if (payload.email) {
//     user.email = payload.email;
//   }

//   if (payload.password) {
//     user.password = payload.password; // auto-hashed by pre-save hook
//     user.needsPasswordChange = true;
//     user.passwordChangedAt = new Date();
//   }

//   if (payload.status) {
//     user.accountStatus = payload.status;
//   }

//   // 4️ Assign permissions directly (validate pageIds)
//   if (payload.permissions && Array.isArray(payload.permissions)) {
//     const pageIds = payload.permissions.map((p: { pageId: Types.ObjectId }) => p.pageId);
//     const validPages = await PageModel.find({ _id: { $in: pageIds } });
//     if (validPages.length !== pageIds.length) {
//       throw new AppError(
//         HTTP_STATUS.BAD_REQUEST,
//         "One or more pageIds are invalid."
//       );
//     }

//     user.permissions = payload.permissions.map((perm: { pageId: Types.ObjectId; permission: boolean }) => ({
//       pageId: perm.pageId,
//       permission: perm.permission,
//     }));

//     // populate permissions for frontend
//     await user.populate("permissions.pageId", "title slug");
//   }

//   await user.save();

//   // 5️ Update StaffProfile fields (excluding FirmUser-specific fields)
//   const { email, password, status, permissions, ...profilePayload } = payload;

//   const updatedProfile = await StaffProfile.findOneAndUpdate(
//     { _id: staffProfile._id },
//     {
//       $set: {
//         ...profilePayload,
//         updatedBy: new Types.ObjectId(userId),
//       },
//     },
//     { new: true }
//   );

//   if (!updatedProfile) {
//     throw new AppError(
//       HTTP_STATUS.NOT_FOUND,
//       "Staff profile not found"
//     );
//   }

//   return {
//     staffProfile: updatedProfile,
//     user,
//   };
// };


// const deleteStaff = async (staffUserId: string) => {
//   const session = await mongoose.startSession();

//   try {
//     session.startTransaction();

//     // 1️ Delete the firm user
//     const user = await FirmUser.findByIdAndDelete(staffUserId, { session });
//     if (!user) {
//       throw new AppError(HTTP_STATUS.NOT_FOUND, "Firm user not found.");
//     }

//     // 2️ Delete the staff profile linked to that user
//     const deleted = await StaffProfile.findOneAndDelete(
//       { userId: staffUserId },
//       { session }
//     );

//     if (!deleted) {
//       throw new AppError(HTTP_STATUS.NOT_FOUND, "Staff profile not found.");
//     }

//     // 3️ Commit transaction ( both deleted)
//     await session.commitTransaction();
//     session.endSession();

//     return { message: "Firm user and staff profile deleted successfully." };
//   } catch (err) {
//     // ❌ Rollback everything if any error occurs
//     await session.abortTransaction();
//     session.endSession();
//     throw err;
//   }
// };







export const updateStaff = async (
  userId: string,
  staffUserId: string,
  payload: any,
  file?: TUploadedFile
) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  let newFileUrl: string | null = null;

  try {
    // 1️ Fetch FirmUser
    const user = await FirmUser.findById(staffUserId).select("+password").session(session);
    if (!user) throw new AppError(HTTP_STATUS.NOT_FOUND, "User not found");

    // 2️ Fetch StaffProfile
    const staffProfile = await StaffProfile.findOne({ userId: staffUserId }).populate("userId").session(session);
    if (!staffProfile) throw new AppError(HTTP_STATUS.NOT_FOUND, "Staff profile not found");

    const oldImageUrl = staffProfile.image;

    // 3️ Handle file upload
    if (file?.buffer) {
      const imageUrl = await uploadToSpaces(file.buffer, file.originalname, {
        folder: FOLDERS.FIRMS,
        entityId: `staff-${user.firmProfileId}`,
        subFolder: FOLDERS.PROFILES,
      });
      payload.image = imageUrl;
      newFileUrl = imageUrl;
    }

    // 4️ Update FirmUser fields
    if (payload.email) user.email = payload.email;
    if (payload.password) {
      user.password = payload.password; // auto-hashed by pre-save hook
      user.needsPasswordChange = true;
      user.passwordChangedAt = new Date();
    }
    if (payload.status) user.accountStatus = payload.status;

    // 5️ Assign permissions directly (validate pageIds)
    if (payload.permissions && Array.isArray(payload.permissions)) {
      const pageIds = payload.permissions.map((p: { pageId: Types.ObjectId }) => p.pageId);
      const validPages = await PageModel.find({ _id: { $in: pageIds } });
      if (validPages.length !== pageIds.length) {
        throw new AppError(HTTP_STATUS.BAD_REQUEST, "One or more pageIds are invalid.");
      }

      user.permissions = payload.permissions.map((perm: { pageId: Types.ObjectId; permission: boolean }) => ({
        pageId: perm.pageId,
        permission: perm.permission,
      }));

      await user.populate("permissions.pageId", "title slug");
    }

    await user.save({ session });

    // 6️ Update StaffProfile fields
    const { email, password, status, permissions, ...profilePayload } = payload;

    const updatedProfile = await StaffProfile.findOneAndUpdate(
      { _id: staffProfile._id },
      {
        $set: {
          ...profilePayload,
          updatedBy: new Types.ObjectId(userId),
        },
      },
      { new: true, session }
    );

    if (!updatedProfile) throw new AppError(HTTP_STATUS.NOT_FOUND, "Staff profile not found");

    // 7️ Commit transaction
    await session.commitTransaction();
    session.endSession();

    // 8️ After commit → delete old profile image asynchronously
    if (file?.buffer && oldImageUrl) {
      deleteFromSpace(oldImageUrl).catch((err) =>
        console.error(" Failed to delete old staff profile image:", err)
      );
    }

    return {
      staffProfile: updatedProfile,
      user,
    };
  } catch (err) {
    await session.abortTransaction();
    session.endSession();

    // Rollback newly uploaded file if transaction failed
    if (newFileUrl) {
      deleteFromSpace(newFileUrl).catch((cleanupErr) =>
        console.error(" Failed to rollback uploaded staff image:", cleanupErr)
      );
    }

    throw err;
  }
};

export const deleteStaff = async (staffUserId: string) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // 1️ Find user & profile
    const user = await FirmUser.findById(staffUserId).session(session);
    if (!user) throw new AppError(HTTP_STATUS.NOT_FOUND, "Firm user not found.");

    const staffProfile = await StaffProfile.findOne({ userId: staffUserId }).session(session);
    if (!staffProfile) throw new AppError(HTTP_STATUS.NOT_FOUND, "Staff profile not found.");

    const oldImageUrl = staffProfile.image;

    // 2️ Delete FirmUser & StaffProfile
    await FirmUser.findByIdAndDelete(staffUserId, { session });
    await StaffProfile.findOneAndDelete({ userId: staffUserId }, { session });

    await session.commitTransaction();
    session.endSession();

    // 3️ Delete profile image from Space asynchronously
    if (oldImageUrl) {
      deleteFromSpace(oldImageUrl).catch((err) =>
        console.error(" Failed to delete staff profile image after deletion:", err)
      );
    }

    return { message: "Firm user and staff profile deleted successfully." };
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
};












interface StaffRegisterPayload {
  email: string;
  password: string;
  fullName: string;
  designation?: string;
  phone?: string;
  firmProfileId: Types.ObjectId; // optional
  permissions?: { pageId: Types.ObjectId; permission: boolean }[];
  role?: string;
  // image?: string;
  status: "active" | "inactive"; // optional
}

const createStaffUserIntoDB = async (userId: string, payload: StaffRegisterPayload, file: TUploadedFile) => {
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

    // 2️ Create new FirmUser
    const [newUser] = await FirmUser.create(
      [
        {
          email,
          password,
          role,
          accountStatus: status
        },
      ],
      { session }
    );


    let imageUrl: string | undefined = undefined;

    //  Handle file upload
    if (file?.buffer) {
      imageUrl = await uploadToSpaces(file.buffer, file.originalname, {
        folder: FOLDERS.FIRMS,
        entityId: `staff-${firmProfileId}`, // use firmProfileId directly
        subFolder: FOLDERS.PROFILES
      });
    }



    // 3️ Create corresponding StaffProfile
    const [newProfile] = await StaffProfile.create(
      [
        {
          userId: newUser._id,
          firmProfileId: new mongoose.Types.ObjectId(firmProfileId),
          fullName,
          designation,
          phone,
          role,
          image: imageUrl,
          createdBy: new mongoose.Types.ObjectId(userId)
        },
      ],
      { session }
    );

    newUser.firmProfileId = firmProfileId as Types.ObjectId
    newUser.profile = newProfile._id as Types.ObjectId
    await newUser.save({ session });


    // 4️ Assign permissions directly (no service)
    if (permissions && Array.isArray(permissions) && permissions.length > 0) {
      const pageIds = permissions.map((p) => p.pageId);
      const validPages = await PageModel.find({ _id: { $in: pageIds } });
      if (validPages.length !== pageIds.length) {
        throw new AppError(
          HTTP_STATUS.BAD_REQUEST,
          "One or more pageIds are invalid."
        );
      }

      newUser.permissions = permissions.map((perm) => ({
        pageId: perm.pageId,
        permission: perm.permission,
      }));
    }

    await newUser.save({ session });

    // 5️ Populate permissions with page info for frontend
    if (newUser.permissions && newUser.permissions.length > 0) {
      await newUser.populate("permissions.pageId", "title slug");
    }


    // 5️ Generate JWT token
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

    // 6️ Commit transaction
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
