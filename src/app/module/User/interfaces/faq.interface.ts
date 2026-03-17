import { Types } from 'mongoose';

export interface IFaq {
  userProfileId: Types.ObjectId;
  question: string;
  answer: string;
  isActive?: boolean;
}
