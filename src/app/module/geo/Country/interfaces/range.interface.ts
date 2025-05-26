import { Types } from 'mongoose';

export interface IRange {
  _id?: Types.ObjectId;
  country: Types.ObjectId;
  zipCode: Types.ObjectId;
  name: string;
  value: number;
  unit: 'km' | 'miles';
  deletedAt?: Date | null;
}
