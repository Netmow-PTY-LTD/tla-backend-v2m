import mongoose from 'mongoose';

export interface IProfilePhotos {
  companyId: mongoose.Types.ObjectId;
  photos: string[];
  videos: string[];
}
