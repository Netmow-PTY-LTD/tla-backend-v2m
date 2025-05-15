import { Model, Types } from 'mongoose';

export interface ICountryWiseService {
  _id: string;
  countryId: Types.ObjectId;
  serviceIds: Types.ObjectId[];
  deletedAt?: Date | null;
}

export interface CountryWiseServiceModel extends Model<ICountryWiseService> {
  // eslint-disable-next-line no-unused-vars
  isCountryWiseServiceExists(id: string): Promise<ICountryWiseService>;
}
