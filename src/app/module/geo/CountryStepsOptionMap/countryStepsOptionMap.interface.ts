import { Types } from 'mongoose';

export interface ICountryStepsOptionMap {
  step_ref: Types.ObjectId;
  service_ref: Types.ObjectId;
  option_group_ref: Types.ObjectId;
  option_ids: Types.ObjectId[];
  country_ref: Types.ObjectId;
  respondAt: [Date, Date, Date];
}
