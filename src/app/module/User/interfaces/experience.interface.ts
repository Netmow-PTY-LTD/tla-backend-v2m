import mongoose from 'mongoose';

export interface IExperience {
  userProfileId: mongoose.Types.ObjectId;
  // organization?: string;
  // position?: string;
  // startDate?: string;
  // endDate?: string;
  // description?: string;
  years:string;
  months:string
  experience?: string;
  experienceHighlight?: string;
}
