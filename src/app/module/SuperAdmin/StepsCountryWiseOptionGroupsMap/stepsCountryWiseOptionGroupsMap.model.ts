import mongoose, { Schema } from 'mongoose';
import { IStepsCountryWiseOptionGroupsMap } from './stepsCountryWiseOptionGroupsMap.interface';

const stepsCountryWiseOptionGroupsMapSchema =
  new Schema<IStepsCountryWiseOptionGroupsMap>(
    {
      option_group_ids: [
        {
          type: Schema.Types.ObjectId,
          ref: 'OptionGroup',
          required: true,
        },
      ],
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

const StepsCountryWiseOptionGroupsMap =
  mongoose.model<IStepsCountryWiseOptionGroupsMap>(
    'StepsCountryWiseOptionGroupsMap',
    stepsCountryWiseOptionGroupsMapSchema,
  );

export default StepsCountryWiseOptionGroupsMap;
