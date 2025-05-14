import { Types } from 'mongoose';

export interface IOption {
  name: string;
  slug: string;
  countryId: Types.ObjectId;
  serviceId: Types.ObjectId;
  questionId: Types.ObjectId;
  selected_options: [Types.ObjectId];
}
