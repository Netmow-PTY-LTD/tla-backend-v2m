import mongoose, { Schema } from 'mongoose';
import { ICountryWiseService } from '../interfaces/countryWiseService.interface';

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
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

const CountryWiseService = mongoose.model<ICountryWiseService>(
  'CountryWiseService',
  countryWiseServiceSchema,
);

export default CountryWiseService;
