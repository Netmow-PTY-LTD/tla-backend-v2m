import { Types } from 'mongoose';

export interface IProfileCustomService {
  _id?: Types.ObjectId;
  userProfileId: Types.ObjectId;
  title?: string;
  description?: string;
}
