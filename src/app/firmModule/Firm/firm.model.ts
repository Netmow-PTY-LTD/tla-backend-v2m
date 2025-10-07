import { Schema, model } from 'mongoose';
import { IFirmProfile } from './firm.interface';
import slugify from 'slugify';
import mongoose from 'mongoose';

//   model
const firmProfileSchema = new Schema<IFirmProfile>(
  {
    // Firm details
    firmName: { type: String, required: true, trim: true },
    firmNameLower: { type: String },
    slug: {
      type: String,
      trim: true,
    },
    logo: { type: String },
    registrationNumber: { type: String },
    vatTaxId: { type: String },
    yearEstablished: { type: Number },
    legalFocusAreas: { type: [String], default: [] },
    // Contact info
    contactInfo: {
      country: { type: Schema.Types.ObjectId, ref: 'Country', required: true },
      city: { type: Schema.Types.ObjectId, ref: 'City', required: true },
      zipCode: { type: Schema.Types.ObjectId, ref: 'ZipCode', required: true },
      phone: { type: String },
      email: { type: String },
      officialWebsite: { type: String },
    },
    // Firm Overview
    companySize: {
      type: String,
      enum: [
        'self_employed',
        '2_10_employees',
        '11_50_employees',
        '51_200_employees',
        'over_200_employees',
      ],
      default: 'self_employed',
      set: (value: string) => {
        return value === '' ? 'self_employed' : value;
      },
    },
    yearsInBusiness: {
      type: Number,
      min: 0,
    },
    description: {
      type: String,
      trim: true,
    },
    // Credits & Billing
    credits: {
      currentCreditBalance: { type: Number, default: 0 },
      billingContact: { type: String },
      defaultCurrency: { type: String, default: 'USD' },
    },

    //billing and tax info

    billingInfo: {
      billingEmail: { type: String },
      iban: { type: String },
      bicSwift: { type: String },
      taxId: { type: String },
      currency: { type: String },
      notes: { type: String },
    },
    lawyers: [
      {
        type: Schema.Types.ObjectId,
        ref: 'UserProfile', // reference to lawyer's profile
      },
    ],

    // Permissions
    createdBy: { type: Schema.Types.ObjectId, ref: 'FirmUser', required: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'FirmUser' },
  },
  { timestamps: true, versionKey: false },
);







// 🔁 Pre-save hook to generate unique slug

// Pre-save hook to generate unique slug from firmName
firmProfileSchema.pre('save', async function (next) {
  if (!this.isModified('firmName')) return next();
  this.firmNameLower = this.firmName.toLowerCase();

  const baseSlug = slugify(this.firmName, { lower: true, strict: true });
  let slug = baseSlug;
  let count = 0;

  // Ensure uniqueness
  while (await mongoose.models.FirmProfile.exists({ slug })) {
    count++;
    slug = `${baseSlug}-${count}`;
  }

  this.slug = slug;
  next();
});


firmProfileSchema.pre('findOneAndUpdate', async function (next) {
  const update = this.getUpdate();

  if (update && !Array.isArray(update) && 'firmName' in update) {
    update.firmNameLower = update.firmName.toLowerCase();
    // Get the current document
    const existing = await this.model.findOne(this.getQuery()).select('firmName');

    // Only update slug if firmName is actually changing
    if (existing && update.firmName !== existing.firmName) {
      const baseSlug = slugify(update.firmName, { lower: true, strict: true });
      let slug = baseSlug;
      let count = 0;

      while (await mongoose.models.FirmProfile.exists({ slug })) {
        count++;
        slug = `${baseSlug}-${count}`;
      }

      // Preserve existing update and just update slug
      this.setUpdate({ ...update, slug });
    }
  }
  next();
});







firmProfileSchema.index(
  { firmNameLower: 1, 'contactInfo.country': 1 },
  { unique: true, }
);




export const FirmProfile = model<IFirmProfile>(
  'FirmProfile',
  firmProfileSchema,
);
