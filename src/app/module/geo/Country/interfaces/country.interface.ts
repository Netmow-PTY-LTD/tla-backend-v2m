import { Model, Types } from 'mongoose';

export interface ICountry {
  _id?: string;
  name: string;
  slug: string;
  serviceIds: [Types.ObjectId];
  deletedAt?: Date | null;
}

export interface CountryModel extends Model<ICountry> {
  // eslint-disable-next-line no-unused-vars
  isCountryExists(id: string): Promise<ICountry>;
}
