import mongoose, { Schema } from 'mongoose';
import { IOption, OptionModel } from '../interfaces/option.interface';

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
    countryId: {
      type: Schema.Types.ObjectId,
      ref: 'Country',
      required: true,
    },
    serviceId: {
      type: Schema.Types.ObjectId,
      ref: 'Service',
      required: true,
    },
    questionId: {
      type: Schema.Types.ObjectId,
      ref: 'Question',
      required: true,
    },
    selected_options: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Option',
      },
    ],
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

//creating a custom static method
optionSchema.statics.isOptionExists = async function (id: string) {
  const existingOption = await Option.findById(id);
  return existingOption;
};
const Option = mongoose.model<IOption, OptionModel>('Option', optionSchema);
export default Option;
