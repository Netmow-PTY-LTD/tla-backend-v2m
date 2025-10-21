import mongoose, { Schema } from "mongoose";
import { ICity } from "./city.interface";
import ZipCode from "./zipcode.model";

// const CitySchema = new Schema<ICity>(
//   {
//     name: { type: String, required: true, trim: true },
//     countryId: { type: Schema.Types.ObjectId, ref: "Country", required: true },
//     region: { type: String },

//   },
//   { timestamps: true }
// );



// export const City = mongoose.model<ICity>("City", CitySchema);










const CitySchema = new Schema<ICity>(
  {
    name: { type: String, required: true, trim: true },

    countryId: {
      type: Schema.Types.ObjectId,
      ref: "Country",
      required: true,
    },

    region: { type: String, trim: true }, // e.g., State/Province

    zipCode: {
      type: Schema.Types.ObjectId,  // Multiple ZIP/postal codes for large cities
      ref: "ZipCode",
      required: true,
    },

    areaNames: [
      {
        type: String,
        trim: true,
      },
    ], // Optional: neighborhoods or districts

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
    timezone: { type: String, trim: true }, // e.g., "Asia/Dhaka"
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Create 2dsphere index for location queries
CitySchema.index({ location: "2dsphere" });


CitySchema.pre("save", async function (next) {
  const city = this as any;

  // If zipCode field is not modified, skip updating location
  if (!city.isModified("zipCode") || !city.zipCode) return next();

  try {
    const zip = await ZipCode.findById(city.zipCode).select("location");

    if (zip && zip.location?.coordinates?.length === 2) {
      city.location = {
        type: "Point",
        coordinates: zip.location.coordinates, // directly use ZIP coordinates
      };
    }

    next();
  } catch (err) {
    next(err as Error);
  }
});



export const City = mongoose.model<ICity>("City", CitySchema);
