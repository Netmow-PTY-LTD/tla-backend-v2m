import mongoose, { Schema } from 'mongoose';
import { ICountryWiseServiceMap } from '../interfaces/countryWiseServiceMap.interface';

const countryWiseServiceMapSchema = new Schema<ICountryWiseServiceMap>(
  {
    country_obj: {
      type: Schema.Types.ObjectId,
      ref: 'Country',
      required: true,
    },
    service_id: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Service', // Assumed reference
        required: true,
      },
    ],
    respondAt: {
      type: [Date],
      validate: {
        validator: function (arr: Date[]) {
          return arr.length === 3;
        },
        message: 'respondAt must contain exactly 3 dates.',
      },
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

const CountryWiseServiceMap = mongoose.model<ICountryWiseServiceMap>(
  'CountryWiseServiceMap',
  countryWiseServiceMapSchema,
);

export default CountryWiseServiceMap;
