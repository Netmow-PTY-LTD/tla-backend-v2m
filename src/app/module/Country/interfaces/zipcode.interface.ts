import { Model, Types } from 'mongoose';

export interface IZipCode {
  _id?: string;
  zipcode: string;
  countryId: Types.ObjectId;
  deletedAt?: Date | null;
  zipCodeType: string;
  countryCode?: string;
  longitude?: string;
  latitude?: string;
}

export interface ZipCodeModel extends Model<IZipCode> {
  // eslint-disable-next-line no-unused-vars
  isZipCodeExists(id: string): Promise<IZipCode>;
}
