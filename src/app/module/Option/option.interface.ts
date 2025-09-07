import { Model, Types } from 'mongoose';

export interface IOption {
  _id: Types.ObjectId;
  name: string;
  slug: string;
  countryId: Types.ObjectId;
  serviceId: Types.ObjectId;
  questionId: Types.ObjectId;
  order: number;
  selected_options: [Types.ObjectId];
  deletedAt?: Date;
}

export interface OptionModel extends Model<IOption> {
  // eslint-disable-next-line no-unused-vars
  isOptionExists(id: string): Promise<IOption>;
}
