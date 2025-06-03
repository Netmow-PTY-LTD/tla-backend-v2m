import mongoose from 'mongoose';

const profileServiceCustomSchema = new mongoose.Schema(
  {
    userProfileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'UserProfile', // Reference to the user profile
      required: true,
    },
    title: {
      type: String,
      trim: true,
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

export const ProfileCustomService = mongoose.model(
  'ProfileCustomService',
  profileServiceCustomSchema,
);
export default ProfileCustomService;
