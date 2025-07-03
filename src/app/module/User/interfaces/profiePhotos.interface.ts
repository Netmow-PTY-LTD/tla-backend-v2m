import mongoose from 'mongoose';

export interface IProfilePhotos {
  userProfileId: mongoose.Types.ObjectId;
  photos: string[];
  videos: string[];
}
