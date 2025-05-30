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
        enum: ['no_location', 'online_only', 'multiple_location'],
      },
    },
    companySize: {
      type: String,
      enum: [
        'self_employed',
        '2_10_employees',
        '11_50_employees',
        '51_200_employees',
        'over_200_employees',
      ],
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
