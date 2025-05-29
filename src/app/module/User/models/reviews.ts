import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    userProfileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'UserProfile', // Reference to the user profile
      required: true,
    },
    reviewerName: {
      type: String,
      trim: true,
    },
    reviewerEmail: {
      type: String,
      lowercase: true,
      trim: true,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      trim: true,
    },
    source: {
      type: String,
      enum: ['Bark', 'Facebook', 'Manual'],
      default: 'Manual',
    },
    sourceLink: {
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

module.exports = mongoose.model('Review', reviewSchema);
