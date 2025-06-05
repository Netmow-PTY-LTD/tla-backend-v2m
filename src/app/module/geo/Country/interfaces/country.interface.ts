import { Model, Types } from 'mongoose';

export interface ICountry {
  _id?: string;
  name: string;
  slug: string;
  serviceIds: [Types.ObjectId];
  deletedAt?: Date | null;
}

export interface ICountryWiseLocationGroup {
  countryId: Types.ObjectId;
  locationGroup?: string; // e.g., 'nation', '1000', '2000'
  latitude?: number;
  longitude?: number;
}

export interface CountryModel extends Model<ICountry> {
  // eslint-disable-next-line no-unused-vars
  isCountryExists(id: string): Promise<ICountry>;
}
