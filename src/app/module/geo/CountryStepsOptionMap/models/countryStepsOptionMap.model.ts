import mongoose, { Schema } from 'mongoose';
import { ICountryStepsOptionMap } from '../interfaces/countryStepsOptionMap.interface';

const countryStepsOptionMapSchema = new Schema<ICountryStepsOptionMap>(
  {
    step_ref: {
      type: Schema.Types.ObjectId,
      ref: 'Step',
      required: true,
    },
    service_ref: {
      type: Schema.Types.ObjectId,
      ref: 'Service',
      required: true,
    },
    option_group_ref: {
      type: Schema.Types.ObjectId,
      ref: 'OptionGroup',
      required: true,
    },
    option_ids: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Option',
        required: true,
      },
    ],
    country_ref: {
      type: Schema.Types.ObjectId,
      ref: 'Country',
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

const CountryStepsOptionMap = mongoose.model<ICountryStepsOptionMap>(
  'CountryStepsOptionMap',
  countryStepsOptionMapSchema,
);

export default CountryStepsOptionMap;
