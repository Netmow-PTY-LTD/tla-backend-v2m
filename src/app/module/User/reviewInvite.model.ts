import mongoose from 'mongoose';

const reviewInviteSchema = new mongoose.Schema(
  {
    userProfileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'UserProfile', // Reference to the user profile
      required: true,
    },
    invitedEmails: [
      {
        type: String,
        lowercase: true,
        trim: true,
      },
    ],
    inviteLink: {
      type: String,
      trim: true,
    },
    facebookReviewLink: {
      type: String,
      trim: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    versionKey: false,
    timestamps: true,
  },
);

module.exports = mongoose.model('ReviewInvite', reviewInviteSchema);
