import { Document, Schema, Types } from 'mongoose';

export interface IFirmProfile extends Document {
  // Firm details
  firmName: string;
  firmNameLower: string;
  slug: string;
  logo?: string;
  registrationNumber?: string;
  vatTaxId?: string;
  brandColor?: string;
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

  location?: {
    address?: string;
    coordinates?: {
      lat?: number;
      lng?: number;
    };
    hideFromProfile?: boolean;
    locationReason?: 'No Location' | 'Online only' | 'Multiple Location';
  };
  // Firm Overview
  companySize?: string;
  yearsInBusiness?: number;
  description?: string;

  billingInfo: {
    billingEmail?: string;
    iban?: string;
    bicSwift?: string;
    taxId?: string;
    currency?: string;
    notes?: string;
    vatTaxId?: string;
  };

  // Credits & Billing
  credits: {
    currentCreditBalance: number;
    billingContact?: string;
    defaultCurrency: string;
  };
  lawyers: Types.ObjectId[]; // references to lawyer's profiles
  // Permissions
  createdBy: Schema.Types.ObjectId;
  updatedBy?: Schema.Types.ObjectId;
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
  createdAt?: Date;
  updatedAt?: Date;
}
