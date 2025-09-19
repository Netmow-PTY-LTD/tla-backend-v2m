import mongoose, { Schema, model, Document } from "mongoose";
import { IFirmProfile } from "./firm.interface";



//   model 
const firmProfileSchema = new Schema<IFirmProfile>(
  {
    // Firm details
    firmUser: { type: Schema.Types.ObjectId, ref: 'FirmUser', required: true, },
    firmName: { type: String, required: true, trim: true },
    logo: { type: String },
    registrationNumber: { type: String },
    vatTaxId: { type: String },
    yearEstablished: { type: Number },
    legalFocusAreas: { type: [String], default: [] },

    // Contact info
    contactInfo: {
      country: { type: Schema.Types.ObjectId, ref: 'Country', required: true },
      city: { type: Schema.Types.ObjectId, ref: 'City', required: true },
      zipCode: { type: Schema.Types.ObjectId, ref: 'ZipCode', required: true },
      phone: { type: String },
      email: { type: String },
      officialWebsite: { type: String },
    },

    // Firm Overview
    overview: { type: String },

    // Credits & Billing
    credits: {
      currentCreditBalance: { type: Number, default: 0 },
      billingContact: { type: String },
      defaultCurrency: { type: String, default: "USD" },
    },

    // Permissions
    createdBy: { type: Schema.Types.ObjectId, ref: "FirmUser", required: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: "FirmUser" },
  },
  { timestamps: true }
);

export const FirmProfile = model<IFirmProfile>(
  "FirmProfile",
  firmProfileSchema
);
