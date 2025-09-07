import mongoose from 'mongoose';
import { Model } from 'mongoose';

export interface ICountryServiceField {
  _id: mongoose.Types.ObjectId;
  countryId: mongoose.Types.ObjectId;
  serviceId: mongoose.Types.ObjectId;
  thumbImage: string;
  bannerImage: string;
  baseCredit: number;
  
}

export interface CountryServiceFieldModel extends Model<ICountryServiceField> {
  // eslint-disable-next-line no-unused-vars
  isExists(id: string): Promise<ICountryServiceField | null>;
}
