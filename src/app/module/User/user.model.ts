import mongoose, { Schema, model } from 'mongoose';
import { USER_PROFILE } from './user.constant';
import { IUserProfile } from './user.interface';
import slugify from 'slugify';

// Define the schema for the user profile
const userProfileSchema = new Schema<IUserProfile>(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true, // 1:1 relationship
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      trim: true,
    },
    lawyerContactEmail: {
      type: String,
    },
    designation: {
      type: String,
      trim: true,
    },
    law_society_member_number: {
      type: String,
      trim: true,
    },
    practising_certificate_number: {
      type: String,
      trim: true,
    },
    gender: {
      type: String,
      enum: {
        values: ['male', 'female', 'other', ''],
        message: 'Gender must be either male, female, or other',
      },
      trim: true,
      default: ''
    },
    languages: [{ type: String }],
    profileType: {
      type: String,
      enum: Object.values(USER_PROFILE),
      default: USER_PROFILE.BASIC,
    },
    country: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Country',
    },
    zipCode: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ZipCode',
    },
    profilePicture: {
      type: String,
      trim: true,
    },
    bio: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },

    // Add more profile-specific fields here
    businessName: { type: String },
    credits: { type: Number, default: 0 },
    billingAddress: {
      contactName: String,
      addressLine1: String,
      addressLine2: String,
      city: String,
      postcode: String,
      phoneNumber: String,
      isVatRegistered: Boolean,
      vatNumber: String,
    },


    // Stripe identifiers (safe)
    subscriptionId: { type: Schema.Types.ObjectId, ref: 'UserSubscription', default: null },
    eliteProSubscriptionId: { type: Schema.Types.ObjectId, ref: 'EliteProUserSubscription', default: null },
    isElitePro: { type: Boolean, default: false },
  // Regular subscription period
    subscriptionPeriodStart: { type: Date, default: null },
    subscriptionPeriodEnd: { type: Date, default: null },

    // Elite Pro subscription period
    eliteProPeriodStart: { type: Date, default: null },
    eliteProPeriodEnd: { type: Date, default: null },

    //payment refference
    paymentMethods: [{ type: Schema.Types.ObjectId, ref: 'PaymentMethod' }],
    autoTopUp: { type: Boolean, default: false },
    serviceIds: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Service',
      },
    ],

    //  rating related

    avgRating: {
      type: Number,
      default: 0,
    },
    totalRatings: {
      type: Number,
      default: 0,
    },
    //   firm related fields
    firmProfileId: { type: Schema.Types.ObjectId, ref: 'FirmProfile', default: null },
    firmMembershipStatus: { type: String, enum: ['pending', 'approved', 'rejected', 'cancelled', 'left'], default: 'pending' },

    joinedAt: { type: Date, default: null },
    leftAt: { type: Date, default: null },
    activeFirmRequestId: {
      type: Schema.Types.ObjectId,
      ref: 'LawyerRequestAsMember',
      default: null,
    },
    isFirmMemberRequest: {
      type: Boolean,
      default: false,
    },

    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    versionKey: false,
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        return ret;
      },
    },
    toObject: {
      transform(doc, ret) {
        return ret;
      },
    },
  },
);

// 🔁 Pre-save hook to generate unique slug
userProfileSchema.pre('save', async function (next) {
  if (!this.isModified('name')) return next();

  const baseSlug = slugify(this.name, { lower: true, strict: true });
  let slug = baseSlug;
  let count = 0;

  // Ensure uniqueness
  while (await mongoose.models.UserProfile.exists({ slug })) {
    count++;
    slug = `${baseSlug}-${count}`;
  }

  this.slug = slug;
  next();
});

userProfileSchema.pre('findOneAndUpdate', async function (next) {
  const update = this.getUpdate();

  if (update && !Array.isArray(update) && 'name' in update) {
    // Get the current document
    const existing = await this.model.findOne(this.getQuery()).select('name');

    // Only update slug if name is actually changing
    if (existing && update.name !== existing.name) {
      const baseSlug = slugify(update.name, { lower: true, strict: true });
      let slug = baseSlug;
      let count = 0;

      while (await mongoose.models.UserProfile.exists({ slug })) {
        count++;
        slug = `${baseSlug}-${count}`;
      }

      // Preserve existing update and just update slug
      this.setUpdate({ ...update, slug });
    }
  }

  next();
});

// Creating the model for UserProfile
export const UserProfile = model<IUserProfile>(
  'UserProfile',
  userProfileSchema,
);
export default UserProfile;
