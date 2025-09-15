import { Schema } from "mongoose";

export interface IFirmProfile extends Document {
  // 1. Firm Details
  firmName: string;
  logo?: string; // Branding image URL
  registrationNumber?: string;
  vatTaxId?: string;
  yearEstablished?: number;
  legalFocusAreas?: string[]; // e.g. ["Corporate Law", "Family Law"]

  // 2. Contact Information
  contactInfo: {
    officeAddress?: string;
    city?: string;
    phone?: string;
    email?: string;
    officialWebsite?: string;
  };

  // 3. Managing Partners / Key Contacts
  managingPartners: {
    fullName: string;
    positionOrTitle?: string;
    contactEmail?: string;
    barAssociationLicense?: string;
    licenseDetails?: string;
  }[];

  // 4. Jurisdiction & Licensing
  jurisdictions: {
    regionOrState: string;
    barRegistrationCertificate?: string;
    barRegistrationNumber?: string;
    operatingLicenses?: string[];
    gdprCompliances?: string[];
  }[];

  // 5. Firm Overview
  overview?: string; // History, mission, services

  // 6. Credits & Billing (Optional)
  credits?: {
    currentCreditBalance: number;
    billingContact?: string;
    defaultCurrency?: string; // e.g. "USD"
  };


  // 8. Permissions
  createdBy: Schema.Types.ObjectId; // UserProfile/Admin who created
  updatedBy?: Schema.Types.ObjectId;
}

