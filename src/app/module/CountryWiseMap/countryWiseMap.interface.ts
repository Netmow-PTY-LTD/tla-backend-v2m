import { Model, Types } from 'mongoose';

export interface ICountryWiseMap {
  _id: string;
  countryId: Types.ObjectId;
  serviceIds: Types.ObjectId[];

}

export interface CountryWiseMapModel extends Model<ICountryWiseMap> {
  // eslint-disable-next-line no-unused-vars
  isCountryWiseMapExists(id: string): Promise<ICountryWiseMap>;
}
