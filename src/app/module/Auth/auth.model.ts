import mongoose from 'mongoose';

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
    password: {
      type: String,
      required: true,
    },
    activeProfile: {
      type: String,
      enum: ['basic', 'premium', 'admin'],
      default: 'basic',
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
      enum: ['yes', 'no'],
      default: 'no',
    },
    accountStatus: {
      type: String,
      enum: ['active', 'suspended', 'banned'],
      default: 'active',
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
    isDelete: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

const User = mongoose.model('user', userSchema);

export default User;
