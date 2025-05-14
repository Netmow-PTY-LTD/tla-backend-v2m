import { Model, Types } from 'mongoose';

export interface ICountryWiseService {
  countryId: Types.ObjectId;
  serviceIds: Types.ObjectId[];
  deletedAt?: Date | null;
  isDeleted: boolean;
}

export interface CountryWiseServiceModel extends Model<ICountryWiseService> {
  // eslint-disable-next-line no-unused-vars
  isCountryWiseServiceExists(id: string): Promise<ICountryWiseService>;
}
