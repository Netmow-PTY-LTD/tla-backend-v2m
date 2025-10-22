import mongoose, { Types } from 'mongoose';
import { AppError } from '../../errors/error';
import { HTTP_STATUS } from '../../constant/httpStatus';
import { createToken } from '../../module/Auth/auth.utils';
import { StringValue } from 'ms';
import config from '../../config';
import FirmUser from '../FirmAuth/frimAuth.model';
import { Firm_USER_ROLE } from '../FirmAuth/frimAuth.constant';
import { sendNotFoundResponse } from '../../errors/custom.error';
import AdminProfile from './admin.model';
import { TUploadedFile } from '../../interface/file.interface';
import { deleteFromSpace, uploadToSpaces } from '../../config/upload';
import { FOLDERS } from '../../constant';


export const getAdminList = async (userId: string) => {
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

    // 4️ Fetch admin list
    const adminList = await AdminProfile.find(filter)
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

    return adminList;
  } catch (error) {
    throw error; // Let your controller or middleware handle the response
  }
};


const getAdminById = async (adminUserId: string) => {



  const existingUser = await FirmUser.isUserExists(adminUserId);
  if (!existingUser) {
    return sendNotFoundResponse('User not found')
  }

  return AdminProfile.findOne({
    userId: new Types.ObjectId(adminUserId),

  }).populate("userId");

};


// const updateAdmin = async (userId: string, adminUserId: string, payload: any, file: TUploadedFile) => {




//   const user = await FirmUser.findById(adminUserId).select("+password");
//   if (!user) {
//     throw new AppError(HTTP_STATUS.NOT_FOUND, " User not found");
//   }

//   const adminProfile = await AdminProfile.findOne({ userId: adminUserId }).populate("userId");
//   if (!adminProfile) {
//     throw new AppError(HTTP_STATUS.NOT_FOUND, "Admin not found");
//   }

//     if (file) {
//     const fileBuffer = file.buffer;
//     const originalName = file.originalname;

//     if (!fileBuffer) {
//       throw new AppError(HTTP_STATUS.BAD_REQUEST, "File buffer is missing.");
//     }
//     const adminProUrl = await uploadToSpaces(fileBuffer, originalName, {
//       folder: FOLDERS.FIRMS,
//       entityId: `admin-${userId}`,
//       subFolder: FOLDERS.PROFILES
//     });
//     payload.image = adminProUrl;
//   }



//   if (payload.email) {
//     user.email = payload.email;
//   }

//   if (payload.password) {
//     user.password = payload.password; // will be auto-hashed by pre-save hook
//     user.needsPasswordChange = true; // optional: force user to login again
//     user.passwordChangedAt = new Date();
//   }

//   if (payload.email) {
//     user.accountStatus = payload.status;
//   }

//   await user.save();

//   // 3️ Remove fields meant for FirmUser from StaffProfile update payload
//   const { email, password, status, ...profilePayload } = payload;

//   // 4️ Update AdminProfile fields
//   const updatedProfile = await AdminProfile.findOneAndUpdate(
//     { _id: adminProfile?._id },
//     {
//       $set: {
//         ...profilePayload,
//         updatedBy: new Types.ObjectId(userId) // ensure ObjectId type
//       }
//     },
//     { new: true }
//   );

//   if (!updatedProfile) {
//     throw new AppError(
//       HTTP_STATUS.NOT_FOUND,
//       "Admin profile not found "
//     );
//   }

//   return {
//     adminProfile: updatedProfile,
//     user,
//   };
// };





const updateAdmin = async (
  userId: string,
  adminUserId: string,
  payload: any,
  file?: TUploadedFile
) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  let newFileUrl: string | null = null;

  try {
    // Step 1️: Find User and Admin Profile
    const user = await FirmUser.findById(adminUserId).select("+password").session(session);
    if (!user) {
      throw new AppError(HTTP_STATUS.NOT_FOUND, "User not found");
    }

    const adminProfile = await AdminProfile.findOne({ userId: adminUserId })
      .populate("userId")
      .session(session);
    if (!adminProfile) {
      throw new AppError(HTTP_STATUS.NOT_FOUND, "Admin not found");
    }

    // Keep reference to old image before updating
    const oldImageUrl = adminProfile.image;

    // Step 2️: Handle file upload (if present)
    if (file) {
      const fileBuffer = file.buffer;
      const originalName = file.originalname;

      if (!fileBuffer) {
        throw new AppError(HTTP_STATUS.BAD_REQUEST, "File buffer is missing.");
      }

      // Upload new image
      newFileUrl = await uploadToSpaces(fileBuffer, originalName, {
        folder: FOLDERS.FIRMS,
        subFolder: FOLDERS.PROFILES,
        entityId: `admin-${userId}`,
      });

      payload.image = newFileUrl;
    }

    // Step 3️: Update FirmUser fields
    if (payload.email) user.email = payload.email;
    if (payload.password) {
      user.password = payload.password;
      user.needsPasswordChange = true;
      user.passwordChangedAt = new Date();
    }
    if (payload.status) user.accountStatus = payload.status;

    await user.save({ session });

    // Step 4️: Update AdminProfile fields
    const { email, password, status, ...profilePayload } = payload;

    const updatedProfile = await AdminProfile.findOneAndUpdate(
      { _id: adminProfile._id },
      {
        $set: {
          ...profilePayload,
          updatedBy: new Types.ObjectId(userId),
        },
      },
      { new: true, session }
    );

    if (!updatedProfile) {
      throw new AppError(HTTP_STATUS.NOT_FOUND, "Admin profile not found");
    }

    // Step 5️: Commit transaction
    await session.commitTransaction();
    session.endSession();

    // Step 6️: After commit — delete old image asynchronously
    if (file && oldImageUrl) {
      deleteFromSpace(oldImageUrl).catch((err) =>
        console.error(" Failed to delete old admin image from Space:", err)
      );
    }

    return {
      adminProfile: updatedProfile,
      user,
    };
  } catch (err) {
    await session.abortTransaction();
    session.endSession();

    // Rollback newly uploaded file if transaction failed
    if (newFileUrl) {
      deleteFromSpace(newFileUrl).catch((cleanupErr) =>
        console.error(" Failed to rollback uploaded admin image:", cleanupErr)
      );
    }

    throw err;
  }
};










const deleteAdmin = async (adminUserId: string) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    // 1️ Delete the firm user
    const user = await FirmUser.findByIdAndDelete(adminUserId, { session });
    if (!user) {
      throw new AppError(HTTP_STATUS.NOT_FOUND, "Firm user not found.");
    }

    // 2️ Delete the admin profile linked to that user
    const deleted = await AdminProfile.findOneAndUpdate(
      { userId: adminUserId },
      { isDeleted: true },
      { session }
    );

    if (!deleted) {
      throw new AppError(HTTP_STATUS.NOT_FOUND, "Admin profile not found.");
    }

    // 3️ Commit transaction (✅ both deleted)
    await session.commitTransaction();
    session.endSession();

    return { message: "Firm user and admin profile deleted successfully." };
  } catch (err) {
    // ❌ Rollback everything if any error occurs
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
};




interface AdminRegisterPayload {
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

const createAdminUserIntoDB = async (userId: string, payload: AdminRegisterPayload) => {
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
      role = Firm_USER_ROLE.ADMIN,
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
          name: fullName,
          email,
          password,
          role,
          // permissions: permissions || [],
          accountStatus: status
        },
      ],
      { session }
    );

    // 3️⃣ Create corresponding AdminProfile
    const [newProfile] = await AdminProfile.create(
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



export const adminService = {
  getAdminList,
  getAdminById,
  updateAdmin,
  deleteAdmin,
  createAdminUserIntoDB
};
