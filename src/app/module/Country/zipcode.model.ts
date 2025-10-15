import mongoose from 'mongoose';
import { Schema } from 'mongoose';
import { IZipCode, ZipCodeModel } from './zipcode.interface';


const zipCodeSchema = new mongoose.Schema(
  {
    zipcode: {
      type: String,
      required: true,
      trim: true,
    },
    postalCode: {
      type: String,
      trim: true,
    },
    countryId: {
      type: Schema.Types.ObjectId,
      ref: 'Country',
      required: true,
      trim: true,
    },
    zipCodeType: {
      type: String,
      enum: ['default', 'custom'],
      default: 'custom',
    },
    countryCode: {
      type: String,
      trim: true
    },
    latitude: {
      type: String,
      trim: true
    },
    longitude: {
      type: String,
      trim: true
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
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

zipCodeSchema.statics.isZipCodeExists = async function (id: string) {
  return await ZipCode.findById(id);
};



zipCodeSchema.index({ location: '2dsphere' });



const ZipCode = mongoose.model<IZipCode, ZipCodeModel>(
  'ZipCode',
  zipCodeSchema,
);

export default ZipCode;
