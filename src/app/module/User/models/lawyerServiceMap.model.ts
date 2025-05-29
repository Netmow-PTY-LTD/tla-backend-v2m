import { Schema, model, Types } from 'mongoose';
import { ILawyerServiceMap } from '../interfaces/lawyerServiceMap.interface';

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
    zipCode: {
      type: Types.ObjectId,
      ref: 'Service',
      required: true,
    },
    // rangeInKm: {
    //   type: Types.ObjectId,
    //   ref: 'Service',
    //   required: true,
    // },
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
  { versionKey: false, timestamps: true },
);

export const LawyerServiceMap = model<ILawyerServiceMap>(
  'LawyerServiceMap',
  lawyerServiceMapSchema,
);
