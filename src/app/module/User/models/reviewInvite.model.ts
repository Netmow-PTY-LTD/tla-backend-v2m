import mongoose from 'mongoose';

const reviewInviteSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CompanyProfile',
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
    timestamps: true,
  },
);

module.exports = mongoose.model('ReviewInvite', reviewInviteSchema);
