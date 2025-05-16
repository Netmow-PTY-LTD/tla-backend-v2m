import mongoose from 'mongoose';

// 1. Define the interface for the document
export interface ICompanyProfile {
  userProfileId: mongoose.Types.ObjectId;
  companyName: string;
  logoUrl?: string;
  contactEmail: string;
  phoneNumber?: string;
  website?: string;
  location?: {
    address?: string;
    coordinates?: {
      lat?: number;
      lng?: number;
    };
    hideFromProfile?: boolean;
    locationReason?: 'No Location' | 'Online only' | 'Multiple Location';
  };
  companySize:
    | 'Self-employed / sole trader'
    | '2–10 employees'
    | '11–50 employees'
    | '51–200 employees'
    | 'Over 200 employees';
  yearsInBusiness?: number;
  description?: string;
}
