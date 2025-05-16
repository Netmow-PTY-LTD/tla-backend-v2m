import mongoose from 'mongoose';

const profileServiceCustomSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CompanyProfile',
      required: true,
    },
    photos: [
      {
        type: String,
        trim: true,
      },
    ],
    videos: [
      {
        type: String,
        trim: true,
      },
    ],
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model('ProfilePhotos', profileServiceCustomSchema);
