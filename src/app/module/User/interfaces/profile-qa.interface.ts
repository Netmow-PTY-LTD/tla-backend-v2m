import { Types } from 'mongoose';

export interface IProfileQA {
  userProfileId: Types.ObjectId;
  question: string;
  answer: string;
}
