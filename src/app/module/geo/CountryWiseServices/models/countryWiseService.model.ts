import mongoose, { Schema } from 'mongoose';
import {
  CountryWiseServiceModel,
  ICountryWiseService,
} from '../interfaces/countryWiseService.interface';

const countryWiseServiceSchema = new Schema<ICountryWiseService>(
  {
    countryId: {
      type: Schema.Types.ObjectId,
      ref: 'Country',
      required: true,
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

countryWiseServiceSchema.statics.isCountryWiseServiceExists = async function (
  id: string,
) {
  return await CountryWiseService.findById(id);
};

const CountryWiseService = mongoose.model<
  ICountryWiseService,
  CountryWiseServiceModel
>('CountryWiseService', countryWiseServiceSchema);

export default CountryWiseService;
