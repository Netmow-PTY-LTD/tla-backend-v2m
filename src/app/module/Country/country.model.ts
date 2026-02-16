import mongoose from 'mongoose';
import { CountryModel, ICountry } from './country.interface';
import { Schema } from 'mongoose';

const countriesSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    currency: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },
    serviceIds: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Service',
        required: true,
      },
    ],
    taxPercentage: {
      type: Number,
      default: 0,
    },
    taxAmount: {
      type: Number,
      default: 0,
    },
    taxType: {
      type: String,
      trim: true,
    },
  },
  {
    versionKey: false,
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        return ret;
      },
    },
    toObject: {
      transform(doc, ret) {
        return ret;
      },
    },
  },
);

countriesSchema.statics.isCountryExists = async function (id: string) {
  return await Country.findById(id);
};

const Country = mongoose.model<ICountry, CountryModel>(
  'Country',
  countriesSchema,
);

export default Country;
