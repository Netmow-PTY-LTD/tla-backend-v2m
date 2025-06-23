import mongoose from 'mongoose';
import { CountryModel, ICountry } from '../interfaces/country.interface';
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
