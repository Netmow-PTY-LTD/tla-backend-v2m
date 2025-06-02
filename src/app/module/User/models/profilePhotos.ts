import mongoose, { model } from 'mongoose';
import { IProfilePhotos } from '../interfaces/profiePhotos.interface';

const profileServiceCustomSchema = new mongoose.Schema(
  {
    userProfileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'UserProfile', // Reference to the user profile
      required: true,
    },
    photo: {
      type: String,
      trim: true,
    },

    video: {
      type: String,
      trim: true,
    },
  },
  {
    versionKey: false,
    timestamps: true,
  },
);

// Creating the model for  photos
export const ProfilePhotos = model<IProfilePhotos>(
  'ProfilePhotos',
  profileServiceCustomSchema,
);
export default ProfilePhotos;
