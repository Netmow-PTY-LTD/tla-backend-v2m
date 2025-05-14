import mongoose, { Schema } from 'mongoose';
import { IStepsCountryWiseOptionGroupsMap } from '../interfaces/stepsCountryWiseOptionGroupsMap.interface';

const stepsCountryWiseOptionGroupsMapSchema =
  new Schema<IStepsCountryWiseOptionGroupsMap>(
    {
      option_group_name: {
        type: String,
        required: true,
      },
      slug: {
        type: String,
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
      step_serial: {
        type: Number,
        default: 0,
      },
      respondAt: {
        type: String,
        required: true,
      },
    },
    {
      timestamps: true,
    },
  );

const StepsCountryWiseOptionGroupsMap =
  mongoose.model<IStepsCountryWiseOptionGroupsMap>(
    'StepsCountryWiseOptionGroupsMap',
    stepsCountryWiseOptionGroupsMapSchema,
  );

export default StepsCountryWiseOptionGroupsMap;
