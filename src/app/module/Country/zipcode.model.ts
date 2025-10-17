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
    // latitude: {
    //   type: String,
    //   trim: true
    // },
    // longitude: {
    //   type: String,
    //   trim: true
    // },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        default: [0, 0],
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




/* ---------- Middleware ---------- */

//  Pre-save hook for single create or update (save)
zipCodeSchema.pre('save', function (next) {
  if (this.isModified('latitude') || this.isModified('longitude')) {
    const lat = Number(this.latitude);
    const lon = Number(this.longitude);
    this.location = { type: 'Point', coordinates: [lon, lat] };
  }
  next();
});

//  Pre 'findOneAndUpdate' for updates via findOneAndUpdate()
zipCodeSchema.pre('findOneAndUpdate', function (next) {
  const update: any = this.getUpdate();

  // If latitude/longitude provided in update — sync location
  if (update.latitude !== undefined && update.longitude !== undefined) {
    update.location = {
      type: 'Point',
      coordinates: [update.longitude, update.latitude],
    };
    this.setUpdate(update);
  }

  next();
});

//  Pre 'insertMany' for bulk inserts
zipCodeSchema.pre('insertMany', function (next, docs: any[]) {
  for (const doc of docs) {
    if (doc.latitude && doc.longitude) {
      doc.location = {
        type: 'Point',
        coordinates: [doc.longitude, doc.latitude],
      };
    }
  }
  next();
});




zipCodeSchema.index({ location: '2dsphere' });



const ZipCode = mongoose.model<IZipCode, ZipCodeModel>(
  'ZipCode',
  zipCodeSchema,
);

export default ZipCode;


