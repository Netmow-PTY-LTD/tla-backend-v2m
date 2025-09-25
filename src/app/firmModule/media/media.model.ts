
import mongoose, { model } from 'mongoose';
import { IFirmMedia } from './media.interface';

// Firm Dedicated Media Schema
const firmMediaSchema = new mongoose.Schema(
  {
    firmProfileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FirmProfile', // Reference to the firm profile
      required: true,
    },
    photos: {
      type: [String],
      default: [],
    },
    videos: {
      type: [String],
      default: [],
    },
  },
  {
    versionKey: false,
    timestamps: true,
  },
);

// Model for Firm Media (Photos & Videos)
export const FirmMedia = model<IFirmMedia>(
  'FirmMedia',
  firmMediaSchema,
);

export default FirmMedia;
