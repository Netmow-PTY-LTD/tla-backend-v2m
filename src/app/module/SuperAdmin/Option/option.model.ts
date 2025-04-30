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
    option_group_obj: {
      type: Schema.Types.ObjectId,
      ref: 'OptionGroup',
      required: true,
    },
    respondAt: [
      {
        type: Date,
        required: true,
      },
    ],
  },
  {
    timestamps: true,
  },
);

const Option = mongoose.model<IOption>('Option', optionSchema);
export default Option;
