import { Model } from 'mongoose';

export interface ICountry {
  _id?: string;
  name: string;
  slug: string;
  deletedAt?: Date | null;
  isDeleted: boolean;
}

export interface CountryModel extends Model<ICountry> {
  // eslint-disable-next-line no-unused-vars
  isCountryExists(id: string): Promise<ICountry>;
}
