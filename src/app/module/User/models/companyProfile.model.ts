import mongoose, { model } from 'mongoose';
import { ICompanyProfile } from '../interfaces/companyProfile.interface';

const companyProfileSchema = new mongoose.Schema(
  {
    userProfileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'UserProfile', // Reference to the user profile
      required: true,
    },
    companyName: {
      type: String,
      required: true,
      trim: true,
    },
    logoUrl: {
      type: String,
      default: '',
    },

    contactEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    phoneNumber: {
      type: String,
      trim: true,
    },
    website: {
      type: String,
      trim: true,
    },
    location: {
      address: {
        type: String,
        trim: true,
      },
      coordinates: {
        lat: {
          type: Number,
        },
        lng: {
          type: Number,
        },
      },
      hideFromProfile: {
        type: Boolean,
        default: false,
      },
      locationReason: {
        type: String,
        enum: ['No Location', 'Online only', 'Multiple Location'],
      },
    },
    companySize: {
      type: String,
      // enum: [
      //   'Self-employed / sole trader',
      //   '2–10 employees',
      //   '11–50 employees',
      //   '51–200 employees',
      //   '51–200 employees',
      //   'Over 200 employees',
      // ],
      // required: true,
    },
    yearsInBusiness: {
      type: Number,
      min: 0,
    },
    description: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

export const CompanyProfile = model<ICompanyProfile>(
  'CompanyProfile',
  companyProfileSchema,
);
export default CompanyProfile;
