import mongoose, { model } from 'mongoose';
import { IUser, UserModel } from '../interfaces/auth.interface';
import bcrypt from 'bcryptjs'; // instead of 'bcrypt'
import config from '../../../config';
import {
  PHONE_VERIFICATION_STATUS,
  USER_STATUS,
} from '../constant/auth.constant';
import { USER_ROLE } from '../../../constant';
const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
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
      enum: Object.values(USER_ROLE),
      default: USER_ROLE.USER,
    },
    regUserType: {
      type: String,
      required: true,
      enum: ['client', 'lawyer', 'admin'],
    },
    regType: {
      type: String,
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
      type: String,
      enum: Object.values(PHONE_VERIFICATION_STATUS),
      default: PHONE_VERIFICATION_STATUS.NO,
    },
    phoneNo: {
      type: String,
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
      enum: Object.values(USER_STATUS),
      default: USER_STATUS.ACTIVE,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    profile: { type: mongoose.Schema.Types.ObjectId, ref: 'UserProfile' }, // Reference to profile
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        delete ret.password;
        delete ret.__v;
        return ret;
      },
    },
    toObject: {
      transform(doc, ret) {
        delete ret.password;
        delete ret.__v;
        return ret;
      },
    },
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

// Static method to check if the plain password matches the hashed password
userSchema.statics.isPasswordMatched = async function (
  plainTextPassword,
  hashedPassword,
) {
  return await bcrypt.compare(plainTextPassword, hashedPassword);
};
// Static method to check if a user exists by ID
userSchema.statics.isUserExists = async function (id: string) {
  return await User.findById(id).select('+password');
};
// Static method to check if a user exists by email
userSchema.statics.isUserExistsByEmail = async function (email: string) {
  return await User.findOne({ email }).select('+password');
};

// Static method to check if JWT was issued before password change
userSchema.statics.isJWTIssuedBeforePasswordChanged = function (
  passwordChangedTimestamp: Date,
  jwtIssuedTimestamp: number,
) {
  const passwordChangedTime =
    new Date(passwordChangedTimestamp).getTime() / 1000;
  return passwordChangedTime > jwtIssuedTimestamp;
};
// Create User model
export const User = model<IUser, UserModel>('User', userSchema);

export default User;
