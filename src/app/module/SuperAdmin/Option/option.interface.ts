import { Types } from 'mongoose';

export interface IOption {
  name: string;
  slug: string;
  option_group_obj: Types.ObjectId;
  respondAt: Date[];
}
