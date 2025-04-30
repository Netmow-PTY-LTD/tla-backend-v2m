import { Types } from 'mongoose';

export interface ICountryWiseServiceMap {
  country_obj: Types.ObjectId;
  service_id: Types.ObjectId[];
  respondAt: [Date, Date, Date];
}
