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
    city?: string;
    country?: string;
    // country?: Types.ObjectId;
    // zipCode?: Types.ObjectId;
    
    phone?: string;
    email?: string;
    officialWebsite?: string;
  };

  // Managing Partners
  managingPartners: {
    fullName: string;
    positionOrTitle?: string;
    contactEmail?: string;
    barAssociationLicense?: string;
    licenseDetails?: string;
  }[];

  // Jurisdictions & Licensing
  jurisdictions: {
    regionOrState: string;
    barRegistrationCertificate?: string;
    barRegistrationNumber?: string;
    operatingLicenses: string[];
    gdprCompliances: string[];
  }[];

  // ✅ License Details (from UI screenshot)
  licenseDetails: {
    licenseType: string;   // i.e. Law Firm License
    licenseNumber: string; // i.e. ABC1234567
    issuedBy: string;      // i.e. Bar Association
    validUntil: Date;      // Expiry date
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
