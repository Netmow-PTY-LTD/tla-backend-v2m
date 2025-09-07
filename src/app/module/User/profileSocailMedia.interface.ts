import { Types } from 'mongoose';

export interface IProfileSocialMedia {
  _id?: Types.ObjectId;
  userProfileId: Types.ObjectId;
  website?: string;
  facebook?: string;
  linkedin?: string;
  twitter?: string;
  instagram?: string;
  youtube?: string;
  tiktok?: string;
  pinterest?: string;
  whatsapp?: string;
  telegram?: string;
  threads?: string;
  github?: string;
  other?: string;
  
}
