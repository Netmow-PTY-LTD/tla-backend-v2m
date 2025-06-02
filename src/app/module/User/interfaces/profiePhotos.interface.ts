import mongoose from 'mongoose';

export interface IProfilePhotos {
  companyId: mongoose.Types.ObjectId;
  photo: string;
  video: string;
}
