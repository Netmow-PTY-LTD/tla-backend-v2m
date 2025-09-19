import { Document, Schema, Types } from "mongoose";

export interface IFirmProfile extends Document {
  // Firm details

  firmUser: Types.ObjectId;
  firmName: string;
  logo?: string;
  registrationNumber?: string;
  vatTaxId?: string;
  yearEstablished?: number;
  legalFocusAreas: string[];

  // Contact info
  contactInfo: {
    officeAddress?: string;
    country: Types.ObjectId;
    zipCode: Types.ObjectId;
    city: Types.ObjectId;

    phone?: string;
    email?: string;
    officialWebsite?: string;
  };

  // Firm Overview
  overview?: string;

  // Credits & Billing
  credits: {
    currentCreditBalance: number;
    billingContact?: string;
    defaultCurrency: string;
  };

  // Permissions
  createdBy: Schema.Types.ObjectId;
  updatedBy?: Schema.Types.ObjectId;

  createdAt?: Date;
  updatedAt?: Date;
}
