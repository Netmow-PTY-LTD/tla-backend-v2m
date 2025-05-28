import { Types } from 'mongoose';

export interface IRange {
  _id?: Types.ObjectId;
  countryId: Types.ObjectId;
  zipCodeId: Types.ObjectId;
  name: string;
  value: number;
  unit: 'km' | 'miles';
  deletedAt?: Date | null;
}
