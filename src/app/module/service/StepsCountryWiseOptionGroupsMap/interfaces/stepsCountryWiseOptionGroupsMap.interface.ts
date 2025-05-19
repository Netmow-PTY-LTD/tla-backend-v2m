import { Types } from 'mongoose';

export interface IStepsCountryWiseOptionGroupsMap {
  option_group_name: string;
  slug: string;
  service_ref: Types.ObjectId;
  country_ref: Types.ObjectId;
  step_serial: number;
  respondAt: string;
}
