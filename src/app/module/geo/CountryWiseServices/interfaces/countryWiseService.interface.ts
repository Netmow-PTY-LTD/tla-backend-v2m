import { Types } from 'mongoose';

export interface ICountryWiseService {
  countryId: Types.ObjectId;
  serviceIds: Types.ObjectId[];
  deletedAt?: Date | null;
  isDeleted: boolean;
}
