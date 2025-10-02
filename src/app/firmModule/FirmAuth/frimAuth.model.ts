import mongoose, { model, Schema, Types } from 'mongoose';

import bcrypt from 'bcryptjs'; // instead of 'bcrypt'
import config from '../../config';
import { FirmUserModel, IFirmUser } from './frimAuth.interface';
import { Firm_USER_ROLE, FIRM_USER_STATUS } from './frimAuth.constant';


const firmUserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    role: {
      type: String,
      required: true,
      enum: Object.values(Firm_USER_ROLE),
      default: Firm_USER_ROLE.ADMIN,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    needsPasswordChange: {
      type: Boolean,
      default: true,
    },
    passwordChangedAt: {
      type: Date,
    },
    isPhoneVerified: {
      type: Boolean,
      default: false,
    },
    phone: {
      type: String,
      trim: true
    },
    verifyCode: {
      type: String,
    },
    verifyToken: {
      type: String,
    },
    isVerifiedAccount: {
      type: Boolean,
      default: false,
    },
    googleId: {
      type: String,
    },
    resetPasswordToken: {
      type: String,
    },
    resetPasswordExpires: {
      type: String,
    },
    accountStatus: {
      type: String,
      enum: Object.values(FIRM_USER_STATUS),
      default: FIRM_USER_STATUS.ACTIVE,
    },
    isOnline: { type: Boolean, default: false },
    lastSeen: { type: Date, default: null },
    deletedAt: {
      type: Date,
      default: null,
    },
    pendingEmail: { type: String, lowercase: true, trim: true },
    emailChangeToken: { type: String },
    emailChangeTokenExpires: { type: Date },
    permissions: [
      {
        pageId: { type: Schema.Types.ObjectId },
        permission: { type: Boolean, default: false },

      },
    ],
    firmProfileId: { type: Schema.Types.ObjectId, ref: 'FirmProfile' },
    profile: {
      type: Schema.Types.ObjectId,
      refPath: 'profileModel',
    },
    profileModel: { type: String, enum: ['AdminProfile', 'StaffProfile', 'LawyerProfile'], select: false }

  },
  {
    versionKey: false,
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        ret.password = '';
        return ret;
      },
    },
    toObject: {
      transform(doc, ret) {
        ret.password = '';
        return ret;
      },
    },
  },
);

// Password hashing

// firmUserSchema.pre('save', async function (next) {
//   // eslint-disable-next-line @typescript-eslint/no-this-alias
//   const user = this; // doc

//   // ✅ Prevent re-hashing if password isn't modified
//   if (!user.isModified('password')) {
//     return next();
//   }

//   const generatedHasPassword = await bcrypt.hash(
//     user.password,
//     Number(config.bcrypt_salt_rounds),
//   );
//   // hashing password and save into DB
//   user.password = generatedHasPassword;
//   next();
// });


firmUserSchema.pre('save', async function (next) {
  const user = this;

  // ------------------------
  // 1. Guard: Prevent re-hashing if password isn't modified
  // ------------------------
  if (!user.isModified('password')) {
    return next();
  }

  // ------------------------
  // 2. Handle password hashing
  // ------------------------
  try {
    const saltRounds = Number(config.bcrypt_salt_rounds) || 10; // fallback to 10
    user.password = await bcrypt.hash(user.password, saltRounds);
  } catch (err) {
    return next(err as mongoose.CallbackError);
  }

  // ------------------------
  // 3. Automatically set profileModel based on role
  // ------------------------
  if (!user.profileModel) {
    switch (user.role) {
      case Firm_USER_ROLE.ADMIN:
        user.profileModel = 'AdminProfile';
        break;
      case Firm_USER_ROLE.STAFF:
        user.profileModel = 'StaffProfile';
        break;
      case Firm_USER_ROLE.LAWYER:
        user.profileModel = 'LawyerProfile';
        break;
      default:
        // fallback to AdminProfile if role is invalid or unknown
        user.profileModel = 'AdminProfile';
    }
  }

  next();
});



// Static method to check if the plain password matches the hashed password
firmUserSchema.statics.isPasswordMatched = async function (
  plainTextPassword,
  hashedPassword,
) {
  return await bcrypt.compare(plainTextPassword, hashedPassword);
};
// Static method to check if a user exists by ID
firmUserSchema.statics.isUserExists = async function (id: string) {
  return await FirmUser.findById(id).select('+password');
};
// Static method to check if a user exists by email
firmUserSchema.statics.isUserExistsByEmail = async function (email: string) {
  return await FirmUser.findOne({ email }).select('+password')
  // .populate({
  //   path: 'profile',
  //   select: 'country', //  Only fetch the "country" field
  //   populate: {
  //     path: 'country', // Populate the country field inside profile
  //     model: 'Country', // Replace with your actual Country model name
  //   },
  // });
};


// Static method to check if JWT was issued before password change
firmUserSchema.statics.isJWTIssuedBeforePasswordChanged = function (
  passwordChangedTimestamp: Date,
  jwtIssuedTimestamp: number,
) {
  const passwordChangedTime =
    new Date(passwordChangedTimestamp).getTime() / 1000;
  return passwordChangedTime > jwtIssuedTimestamp;
};
// Create User model
export const FirmUser = model<IFirmUser, FirmUserModel>('FirmUser', firmUserSchema);

export default FirmUser;
