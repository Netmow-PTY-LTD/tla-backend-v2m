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
    // Add more profile-specific fields here
  },
  {
    timestamps: true,
  },
);

export const UserProfile = model<IUserProfile>(
  'UserProfile',
  userProfileSchema,
);
export default UserProfile;
