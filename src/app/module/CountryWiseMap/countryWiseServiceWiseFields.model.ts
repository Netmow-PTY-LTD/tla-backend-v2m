import mongoose, { Schema } from 'mongoose';

import {
  CountryServiceFieldModel,
  ICountryServiceField,
} from './countryWiseServiceWiseField.interface';

const countryWiseServiceWiseFieldSchema = new Schema<ICountryServiceField>(
  {
    countryId: {
      type: Schema.Types.ObjectId,
      ref: 'Country',
      required: true,
    },
    serviceId: {
      type: Schema.Types.ObjectId,
      ref: 'Service',
      required: true,
    },
    thumbImage: {
      type: String,
      required: true,
    },
    bannerImage: {
      type: String,
      required: true,
    },
    baseCredit: {
      type: Number,
      required: true,
      min: 0,
    },
    
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

countryWiseServiceWiseFieldSchema.statics.isCountryWiseServiceWiseFieldExists =
  async function (id: string) {
    return await CountryWiseServiceWiseField.findById(id);
  };

const CountryWiseServiceWiseField = mongoose.model<
  ICountryServiceField,
  CountryServiceFieldModel
>('CountryWiseServiceWiseField', countryWiseServiceWiseFieldSchema);

export default CountryWiseServiceWiseField;
