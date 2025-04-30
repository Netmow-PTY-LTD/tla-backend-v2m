import mongoose from 'mongoose';

const serviceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    respondAt: {
      type: String,
    },
    reviewedAt: {
      type: String,
    },
    completedAt: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

const Service = mongoose.model('Service', serviceSchema);

export default Service;
