import { Types } from 'mongoose';

export interface IOption {
  name: string;
  slug: string;
  service_ref: Types.ObjectId;
  country_ref: Types.ObjectId;
  step_ref: Types.ObjectId;
  selected_options: [Types.ObjectId];
}
