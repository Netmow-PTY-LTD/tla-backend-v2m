import mongoose, { Schema } from 'mongoose';
import { ICountryWiseLocationGroup } from '../interfaces/country.interface';

const countryWiseLocationGroupSchema = new Schema<ICountryWiseLocationGroup>(
  {
    countryId: {
      type: Schema.Types.ObjectId,
      ref: 'Country',
      required: true,
    },
    locationGroupName: {
      type: String,
      trim: true,
    },
    latitude: {
      type: Number,
    },
    longitude: {
      type: Number,
    },
  },
  { timestamps: true },
);

export const LocationGroup = mongoose.model<ICountryWiseLocationGroup>(
  'LocationGroup',
  countryWiseLocationGroupSchema,
);
