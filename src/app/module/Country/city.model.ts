import mongoose, { Schema } from "mongoose";
import { ICity } from "./city.interface";

const CitySchema = new Schema<ICity>(
  {
    name: { type: String, required: true, trim: true },
    countryId: { type: Schema.Types.ObjectId, ref: "Country", required: true },
    region: { type: String },
   
  },
  { timestamps: true }
);



export const City = mongoose.model<ICity>("City", CitySchema);