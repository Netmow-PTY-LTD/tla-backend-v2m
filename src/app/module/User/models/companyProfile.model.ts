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
      trim: true,
    },
    logoUrl: {
      type: String,
      default: '',
    },

    contactEmail: {
      type: String,

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
      },
    },
    companySize: {
      type: String,
      enum: [
        'self_employed',
        '2_10_employees',
        '11_50_employees',
        '51_100_employees',
        'over_100_employees',
      ],
      default: 'self_employed',
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
    versionKey: false,
    timestamps: true,
  },
);

export const CompanyProfile = model<ICompanyProfile>(
  'CompanyProfile',
  companyProfileSchema,
);
export default CompanyProfile;
