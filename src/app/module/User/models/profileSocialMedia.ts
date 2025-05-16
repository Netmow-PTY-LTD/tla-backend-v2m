import mongoose from 'mongoose';

const profileSocialMediaSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CompanyProfile',
      required: true,
    },
    website: {
      type: String,
      trim: true,
    },
    facebook: {
      type: String,
      trim: true,
    },
    linkedin: {
      type: String,
      trim: true,
    },
    twitter: {
      type: String,
      trim: true,
    },
    instagram: {
      type: String,
      trim: true,
    },
    youtube: {
      type: String,
      trim: true,
    },
    tiktok: {
      type: String,
      trim: true,
    },
    pinterest: {
      type: String,
      trim: true,
    },
    whatsapp: {
      type: String,
      trim: true,
    },
    telegram: {
      type: String,
      trim: true,
    },
    threads: {
      type: String,
      trim: true,
    },
    github: {
      type: String,
      trim: true,
    },
    other: {
      type: String,
      trim: true,
      description: 'Any other custom social link',
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model('ProfileSocialMedia', profileSocialMediaSchema);
