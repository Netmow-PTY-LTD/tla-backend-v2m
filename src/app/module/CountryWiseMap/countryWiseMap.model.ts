import mongoose, { Schema } from 'mongoose';
import {
  CountryWiseMapModel,
  ICountryWiseMap,
} from './countryWiseMap.interface';

const countryWiseMapSchema = new Schema<ICountryWiseMap>(
  {
    countryId: {
      type: Schema.Types.ObjectId,
      ref: 'Country',
      required: true,
      unique: true,
    },
    serviceIds: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Service',
        required: true,
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

countryWiseMapSchema.statics.isCountryWiseMapExists = async function (
  id: string,
) {
  return await CountryWiseMap.findById(id);
};

const CountryWiseMap = mongoose.model<ICountryWiseMap, CountryWiseMapModel>(
  'CountryWiseMap',
  countryWiseMapSchema,
);

export default CountryWiseMap;
