import { Types } from 'mongoose';

export interface ILawyerServiceMap {
  _id?: Types.ObjectId;
  userProfile: Types.ObjectId;
  services: Types.ObjectId[];
  country: Types.ObjectId;
  zipCodes: Types.ObjectId[];
  rangeInKm: number;
  practiceWithin: boolean;
  practiceInternationally: boolean;
  isSoloPractitioner: boolean;
}
