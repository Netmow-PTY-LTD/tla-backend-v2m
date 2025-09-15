import { Schema, model, Document } from "mongoose";
import { IFirmProfile } from "./firm.interface";



//   model 
const firmProfileSchema = new Schema<IFirmProfile>(
  {
    // Firm details
    firmName: { type: String, required: true, trim: true },
    logo: { type: String },
    registrationNumber: { type: String },
    vatTaxId: { type: String },
    yearEstablished: { type: Number },
    legalFocusAreas: { type: [String], default: [] },

    // Contact info
    contactInfo: {
      officeAddress: { type: String },
      city: { type: String },
      phone: { type: String },
      email: { type: String },
      officialWebsite: { type: String },
    },

    // Managing Partners
    managingPartners: [
      {
        fullName: { type: String, required: true },
        positionOrTitle: { type: String },
        contactEmail: { type: String },
        barAssociationLicense: { type: String },
        licenseDetails: { type: String },
      },
    ],

    // Jurisdictions & Licensing
    jurisdictions: [
      {
        regionOrState: { type: String, required: true },
        barRegistrationCertificate: { type: String },
        barRegistrationNumber: { type: String },
        operatingLicenses: { type: [String], default: [] },
        gdprCompliances: { type: [String], default: [] },
      },
    ],

    // Firm Overview
    overview: { type: String },

    // Credits & Billing
    credits: {
      currentCreditBalance: { type: Number, default: 0 },
      billingContact: { type: String },
      defaultCurrency: { type: String, default: "USD" },
    },


    // Permissions
    createdBy: { type: Schema.Types.ObjectId, ref: "UserProfile", required: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: "UserProfile" },
  },
  { timestamps: true }
);

export const FirmProfile = model<IFirmProfile>("FirmProfile", firmProfileSchema);
