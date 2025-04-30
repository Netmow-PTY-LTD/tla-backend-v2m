import mongoose, { Schema } from 'mongoose';
import { IOption } from './option.interface';

const optionSchema = new Schema<IOption>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      unique: true,
    },
    service_ref: {
      type: Schema.Types.ObjectId,
      ref: 'Service',
      required: true,
    },
    country_ref: {
      type: Schema.Types.ObjectId,
      ref: 'Country',
      required: true,
    },
    step_ref: {
      type: Schema.Types.ObjectId,
      ref: 'StepsCountryWiseOptionGroupsMap',
      required: true,
    },
    selected_options: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Option',
      },
    ],
  },
  {
    timestamps: true,
  },
);

const Option = mongoose.model<IOption>('Option', optionSchema);
export default Option;
