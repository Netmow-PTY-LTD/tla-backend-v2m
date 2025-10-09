import mongoose, { Schema } from 'mongoose';
import {
  IUserLocationServiceMap,
  LocationType,
} from './leadService.interface';


/* 
under this interface  model will be changeable just use if for test case

*/

const userLocationServiceMapSchema = new Schema<IUserLocationServiceMap>(
  {
    userProfileId: {
      type: Schema.Types.ObjectId,
      ref: 'UserProfile',
      required: true,
    },
    locationGroupId: {
      type: Schema.Types.ObjectId,
      ref: 'ZipCode',
    },
    locationType: {
      type: String,
      enum: Object.values(LocationType),
      required: true,
    },
    rangeInKm: {
      type: Number,
      default: 0,
    },
    traveltime: {
      type: String
    },
    travelmode: {
      type: String
    },
    serviceIds: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Service',
        required: true,
      },
    ],
  },
  { timestamps: true, versionKey: false },
);


export const UserLocationServiceMap = mongoose.model<IUserLocationServiceMap>(
  'UserLocationServiceMap',
  userLocationServiceMapSchema,
);
