import { Model, Types } from 'mongoose';

export interface IZipCode {
  _id?: string;
  zipcode: string;
  postalCode?: string;
  countryId: Types.ObjectId;
  zipCodeType: string;
  countryCode?: string;
  // longitude: string;
  // latitude: string;
  latitude: number;
  longitude: number;
  location?: {
    type: 'Point';
    coordinates: [number, number]; // [lng, lat]
  };
}

export interface ZipCodeModel extends Model<IZipCode> {
  // eslint-disable-next-line no-unused-vars
  isZipCodeExists(id: string): Promise<IZipCode>;
}
