import mongoose from 'mongoose';
import { Schema } from 'mongoose';
import { IZipCode, ZipCodeModel } from '../interfaces/zipcode.interface';


const zipCodeSchema = new mongoose.Schema(
  {
    zipcode: {
      type: String,
      required: true,
      trim: true,
    },
    countryId: {
      type: Schema.Types.ObjectId,
      required: true,
      trim: true,
    },
    zipCodeType: {
      type: String,
      enum: ['default', 'custom'],
      default: 'custom',
    },
    deletedAt: {
      type: Date,
      default: null,
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

const ZipCode = mongoose.model<IZipCode, ZipCodeModel>(
  'ZipCode',
  zipCodeSchema,
);

export default ZipCode;
