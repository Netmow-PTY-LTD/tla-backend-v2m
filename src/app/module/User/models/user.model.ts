import mongoose, { Schema, model } from 'mongoose';
import { USER_PROFILE } from '../constants/user.constant';
import { IUserProfile } from '../interfaces/user.interface';

const userProfileSchema = new Schema<IUserProfile>(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true, // 1:1 relationship
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    activeProfile: {
      type: String,
      enum: Object.values(USER_PROFILE),
      default: USER_PROFILE.BASIC,
    },
    country: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Country',
    },
    deletedAt: {
      type: Date,
      default: null,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    // Add more profile-specific fields here
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        delete ret.__v;
        return ret;
      },
    },
    toObject: {
      transform(doc, ret) {
        delete ret.__v;
        return ret;
      },
    },
  },
);

export const UserProfile = model<IUserProfile>(
  'UserProfile',
  userProfileSchema,
);
export default UserProfile;
