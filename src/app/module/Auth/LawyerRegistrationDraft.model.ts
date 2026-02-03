import mongoose, { Schema, Document, model } from 'mongoose';

/* ================= INTERFACES ================= */

export interface ILawyerRegistrationDraft extends Document {
  step: number;
  regUserType: string;
  username: string;
  email: string;
  role: string;
  password: string;

  profile: {
    name: string;
    gender: string;
    phone: string;
    country: mongoose.Types.ObjectId;
    profileType: string;
    law_society_member_number: string;
    practising_certificate_number: string;
  };

  companyInfo: {
    companyName: mongoose.Types.ObjectId;
    companySize: string;
    companyTeam: boolean;
    website: string;
  };

  lawyerServiceMap: {
    country: mongoose.Types.ObjectId;
    isSoloPractitioner: boolean;
    practiceInternationally: boolean;
    practiceWithin: boolean;
    rangeInKm: number;
    zipCode: mongoose.Types.ObjectId;
    services: mongoose.Types.ObjectId[];
    addressInfo: {
      countryId: mongoose.Types.ObjectId;
      countryCode: string;
      zipcode: string;
      latitude: string;
      longitude: string;
    };
  };

  userProfile: string;
  verification: {
    isEmailVerified: boolean;
    verifiedAt: Date | null;
  };
}

/* ================= SCHEMA ================= */

const LawyerRegistrationDraftSchema = new Schema<ILawyerRegistrationDraft>(
  {
    step: { type: Number, required: true },

    regUserType: { type: String, required: true },
    username: { type: String, default: '' },
    email: { type: String, required: true, index: true },
    role: { type: String, required: true },
    password: { type: String, required: true },

    profile: {
      name: { type: String, required: true },
      gender: { type: String, required: true },
      phone: { type: String, required: true },
      country: { type: Schema.Types.ObjectId, ref: 'Country', required: true },
      profileType: { type: String, required: true },
      law_society_member_number: { type: String },
      practising_certificate_number: { type: String }
    },

    companyInfo: {
      companyName: {
        type: Schema.Types.ObjectId,
        ref: 'Company',
        required: true
      },
      companySize: { type: String },
      companyTeam: { type: Boolean, required: true },
      website: { type: String }
    },

    lawyerServiceMap: {
      country: {
        type: Schema.Types.ObjectId,
        ref: 'Country',
        required: true
      },
      isSoloPractitioner: { type: Boolean, required: true },
      practiceInternationally: { type: Boolean, required: true },
      practiceWithin: { type: Boolean, required: true },
      rangeInKm: { type: Number, required: true },
      zipCode: {
        type: Schema.Types.ObjectId,
        ref: 'ZipCode',
        required: true
      },
      services: [
        {
          type: Schema.Types.ObjectId,
          ref: 'Service',
          required: true
        }
      ],
      addressInfo: {
        countryId: {
          type: Schema.Types.ObjectId,
          ref: 'Country',
          required: true
        },
        countryCode: { type: String, required: true },
        zipcode: { type: String, required: true },
        latitude: { type: String, required: true },
        longitude: { type: String, required: true }
      }
    },

    userProfile: { type: String, default: '' },
    verification: {
      isEmailVerified: { type: Boolean, default: false },
      verifiedAt: { type: Date, default: null }
    }
  },
  {
    timestamps: true,
    collection: 'lawyer_registration_temp_data'
  }
);

/* ================= MODEL ================= */

export const LawyerRegistrationDraft = model<
  ILawyerRegistrationDraft
>(
  'LawyerRegistrationDraft',
  LawyerRegistrationDraftSchema
);
