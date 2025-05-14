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
    respondAt: {
      type: [Date],
      validate: {
        validator: (arr: Date[]) => arr.length === 3,
        message: 'respondAt must contain exactly 3 dates.',
      },
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

const CountryStepsOptionMap = mongoose.model<ICountryStepsOptionMap>(
  'CountryStepsOptionMap',
  countryStepsOptionMapSchema,
);

export default CountryStepsOptionMap;
