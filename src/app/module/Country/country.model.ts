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

countriesSchema.pre('save', function (next) {
  if (this.taxPercentage && this.taxPercentage > 0) {
    this.taxAmount = 0;
  } else if (this.taxAmount && this.taxAmount > 0) {
    this.taxPercentage = 0;
  }
  next();
});

countriesSchema.pre('findOneAndUpdate', function (next) {
  const update = this.getUpdate() as mongoose.UpdateQuery<ICountry>;
  if (!update) return next();

  if (update.taxPercentage && (update.taxPercentage as number) > 0) {
    update.taxAmount = 0;
  } else if (update.taxAmount && (update.taxAmount as number) > 0) {
    update.taxPercentage = 0;
  }

  // Handle $set if present
  if (update.$set) {
    if (update.$set.taxPercentage && (update.$set.taxPercentage as number) > 0) {
      update.$set.taxAmount = 0;
    } else if (update.$set.taxAmount && (update.$set.taxAmount as number) > 0) {
      update.$set.taxPercentage = 0;
    }
  }

  next();
});

countriesSchema.statics.isCountryExists = async function (id: string) {
  return await Country.findById(id);
};

const Country = mongoose.model<ICountry, CountryModel>(
  'Country',
  countriesSchema,
);

export default Country;
