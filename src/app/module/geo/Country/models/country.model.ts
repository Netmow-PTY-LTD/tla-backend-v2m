import mongoose from 'mongoose';
import { CountryModel, ICountry } from '../interfaces/country.interface';

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
    deletedAt: {
      type: Date,
      default: null,
    },
    isDeleted: {
      type: Boolean,
      default: false,
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
