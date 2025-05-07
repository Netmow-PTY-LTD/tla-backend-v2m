import mongoose, { model } from 'mongoose';
import { IUser, UserModel } from './auth.interface';
import bcrypt from 'bcryptjs'; // instead of 'bcrypt'
import config from '../../config';
import {
  PHONE_VERIFICATION_STATUS,
  USER_PROFILE,
  USER_STATUS,
} from './auth.constant';
const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
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
    },
    password: {
      type: String,
      required: true,
    },
    activeProfile: {
      type: String,
      enum: Object.values(USER_PROFILE),
      default: USER_PROFILE.BASIC,
      // enum: ['basic', 'premium', 'admin'],
      // default: 'basic',
    },
    country: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Country',
    },
    verifyCode: {
      type: String,
    },
    verifyToken: {
      type: String,
    },
    phoneNo: {
      type: String,
    },
    isPhoneVerified: {
      type: String,
      enum: Object.values(PHONE_VERIFICATION_STATUS),
      default: PHONE_VERIFICATION_STATUS.NO,
      // enum: ['yes', 'no'],
      // default: 'no',
    },
    accountStatus: {
      type: String,
      enum: Object.values(USER_STATUS),
      default: USER_STATUS.ACTIVE,
      // enum: ['active', 'suspended', 'suspended&spam'],
      // default: 'active',
    },
    googleId: {
      type: String,
    },
    isVerifiedAccount: {
      type: Boolean,
      default: false,
    },
    resetPasswordToken: {
      type: String,
    },
    resetPasswordExpires: {
      type: String,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

// Password hashing

userSchema.pre('save', async function (next) {
  // eslint-disable-next-line @typescript-eslint/no-this-alias
  const user = this; // doc
  // hashing password and save into DB
  user.password = await bcrypt.hash(
    user.password,
    Number(config.bcrypt_salt_rounds),
  );
  next();
});

// set '' after saving password
userSchema.post('save', function (doc, next) {
  doc.password = '';
  next();
});

userSchema.statics.isPasswordMatched = async function (
  plainTextPassword,
  hashedPassword,
) {
  return await bcrypt.compare(plainTextPassword, hashedPassword);
};

userSchema.statics.isUserExists = async function (id: string) {
  return await User.findById(id).select('+password');
};
userSchema.statics.isUserExistsByEmail = async function (email: string) {
  return await User.findOne({ email }).select('+password');
};

export const User = model<IUser, UserModel>('User', userSchema);

export default User;
