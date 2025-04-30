import { Types } from 'mongoose';

export interface IStepsCountryWiseOptionGroupsMap {
  option_group_ids: Types.ObjectId[];
  service_ref: Types.ObjectId;
  country_ref: Types.ObjectId;
  respondAt: [Date, Date, Date]; // Enforce exactly 3 dates
}
