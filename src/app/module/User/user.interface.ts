import { Types } from 'mongoose';
import { UserProfile } from './user.constant';

export interface IUserProfile {
  user: Types.ObjectId;
  name: string;
  activeProfile: UserProfile;
  country?: Types.ObjectId;
}
