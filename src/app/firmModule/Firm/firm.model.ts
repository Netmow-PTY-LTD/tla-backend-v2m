import mongoose, { Schema, model, Document } from 'mongoose';
import { IFirmProfile } from './firm.interface';

//   model
const firmProfileSchema = new Schema<IFirmProfile>(
  {
    // Firm details
    firmUser: { type: Schema.Types.ObjectId, ref: 'FirmUser', required: true },
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


    //   no clarify
    location: {
      address: {
        type: String,
        trim: true,
      },
      coordinates: {
        lat: {
          type: Number,
          default: 0,
        },
        lng: {
          type: Number,
          default: 0,
        },
      },
      hideFromProfile: {
        type: Boolean,
        default: false,
      },
      locationReason: {
        type: String,
        enum: ['no_location', 'online_only', 'multiple_location'],
        default: 'no_location',
        set: (value: string) => {
          return value === '' ? 'no_location' : value;
        },
      },
    },

    // Firm Overview
    companySize: {
      type: String,
      enum: [
        'self_employed',
        '2_10_employees',
        '11_50_employees',
        '51_200_employees',
        'over_200_employees',
      ],
      default: 'self_employed',
      set: (value: string) => {
        return value === '' ? 'self_employed' : value;
      },
    },
    yearsInBusiness: {
      type: Number,
      min: 0,
    },
    description: {
      type: String,
      trim: true,
    },

  

    // Credits & Billing
    credits: {
      currentCreditBalance: { type: Number, default: 0 },
      billingContact: { type: String },
      defaultCurrency: { type: String, default: 'USD' },
    },

      //billing and tax info

    billingInfo: {

      billingEmail: { type: String },

      iban: { type: String },

      bicSwift: { type: String },

      taxId: { type: String },

      currency: { type: String },

      notes: { type: String },
    },

    // Permissions
    createdBy: { type: Schema.Types.ObjectId, ref: 'FirmUser', required: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'FirmUser' },
  },
  { timestamps: true },
);

export const FirmProfile = model<IFirmProfile>(
  'FirmProfile',
  firmProfileSchema,
);
