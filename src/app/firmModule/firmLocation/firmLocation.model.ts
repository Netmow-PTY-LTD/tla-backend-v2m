

import mongoose, { Schema, model } from "mongoose";


export interface IFirmLocation extends mongoose.Document {
  firmProfileId: mongoose.Types.ObjectId;
  name: string;
  address: mongoose.Types.ObjectId ; // Reference to ZipCode
}

const firmLocationSchema = new Schema<IFirmLocation>(
  {
    firmProfileId: { type: Schema.Types.ObjectId, ref: "FirmProfile", required: true },
    name: { type: String, required: true, trim: true },
    address: { type: Schema.Types.ObjectId, ref: "ZipCode", required: true }, // linked ZipCode
  },
  { timestamps: true }
);

export const FirmLocationModel = model<IFirmLocation>(
  "FirmLocation",
  firmLocationSchema
);
