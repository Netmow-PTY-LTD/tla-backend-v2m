import mongoose, { model } from 'mongoose';
import { IProfilePhotos } from '../interfaces/profiePhotos.interface';

const profileServiceCustomSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CompanyProfile',
      required: true,
    },
    photos: [
      {
        type: String,
        trim: true,
      },
    ],
    videos: [
      {
        type: String,
        trim: true,
      },
    ],
  },
  {
    timestamps: true,
  },
);

// Creating the model for  photos
export const ProfilePhotos = model<IProfilePhotos>(
  'ProfilePhotos',
  profileServiceCustomSchema,
);
export default ProfilePhotos;
