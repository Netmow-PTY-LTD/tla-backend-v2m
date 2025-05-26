import { Schema, model, Types } from 'mongoose';

const lawyerServiceMapSchema = new Schema(
  {
    userProfile: {
      type: Types.ObjectId,
      ref: 'UserProfile',
      required: true,
    },
    services: [
      {
        type: Types.ObjectId,
        ref: 'Service',
        required: true,
      },
    ],
    country: {
      type: Types.ObjectId,
      ref: 'Country',
      required: true,
    },

    zipCodes: [
      {
        type: Types.ObjectId,
        ref: 'Service',
        required: true,
      },
    ],
    rangeInKm: {
      type: Number,
      default: 0,
    },
    practiceWithin: {
      type: Boolean,
      default: false,
    },
    practiceInternationally: {
      type: Boolean,
      default: false,
    },
    isSoloPractitioner: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

export const LawyerServiceMap = model(
  'LawyerServiceMap',
  lawyerServiceMapSchema,
);
