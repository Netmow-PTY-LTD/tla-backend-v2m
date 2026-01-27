import mongoose, { model } from 'mongoose';
import { IUser, UserModel } from './auth.interface';
import bcrypt from 'bcryptjs'; // instead of 'bcrypt'
import config from '../../config';
import {
  USER_STATUS,
} from './auth.constant';
import { USER_ROLE } from '../../constant';
const userSchema = new mongoose.Schema(
  {
    // username: {
    //   type: String,
    //   required: true,
    //   unique: true,
    //   trim: true,
    // },
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
      type: Boolean,
      default: false,
    },
    phone: {
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
      default: USER_STATUS.PENDING,
    },
    isOnline: { type: Boolean, default: false },
    lastSeen: { type: Date, default: null },
    deletedAt: {
      type: Date,
      default: null,
    },
    profile: { type: mongoose.Schema.Types.ObjectId, ref: 'UserProfile' }, // Reference to profile
    // New fields for email change
    pendingEmail: { type: String, lowercase: true, trim: true },
    emailChangeToken: { type: String },
    emailChangeTokenExpires: { type: Date },
    createdBy:{ type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    deletedBy:{ type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedBy:{ type: mongoose.Schema.Types.ObjectId, ref: 'User' },
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

userSchema.pre('save', async function (next) {
  // eslint-disable-next-line @typescript-eslint/no-this-alias
  const user = this; // doc

  // ✅ Prevent re-hashing if password isn't modified
  if (!user.isModified('password')) {
    return next();
  }

  const generatedHasPassword = await bcrypt.hash(
    user.password,
    Number(config.bcrypt_salt_rounds),
  );
  // hashing password and save into DB
  user.password = generatedHasPassword;
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
  return await User.findOne({ email }).select('+password').populate({
    path: 'profile',
    select: 'country', // ✅ Only fetch the "country" field
    populate: {
      path: 'country', // ✅ Populate the country field inside profile
      model: 'Country', // Replace with your actual Country model name
    },
  });
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
