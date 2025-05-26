import { Schema, model, Types } from 'mongoose';

const rangeSchema = new Schema(
  {
    // countryId: {
    //   type: Types.ObjectId,
    //   ref: 'Country',
    //   required: true,
    // },
    zipCodeId: {
      type: Types.ObjectId,
      ref: 'ZipCode',
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    value: {
      type: Number,
      required: true,
    },
    unit: {
      type: String,
      enum: ['km', 'miles'],
      default: 'km',
    },
  },
  { timestamps: true },
);

export const Range = model('Range', rangeSchema);
