import mongoose, { Schema, model } from 'mongoose';
import { USER_PROFILE } from '../constants/user.constant';
import { IUserProfile } from '../interfaces/user.interface';

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
    activeProfile: {
      type: String,
      enum: Object.values(USER_PROFILE),
      default: USER_PROFILE.BASIC,
    },
    country: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Country',
    },
    profilePicture: {
      type: String,
      trim: true,
    },
    bio: {
      type: String,
      trim: true,
    },
    deletedAt: {
      type: Date,
      default: null,
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
    paymentMethods: [{ type: Schema.Types.ObjectId, ref: 'PaymentMethod' }],
    autoTopUp: { type: Boolean, default: false },
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

// Creating the model for UserProfile
export const UserProfile = model<IUserProfile>(
  'UserProfile',
  userProfileSchema,
);
export default UserProfile;
