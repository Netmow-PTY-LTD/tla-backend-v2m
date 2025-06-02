import mongoose, { model } from 'mongoose';
import { IAccreditation } from '../interfaces/profileAccreditation';

const accreditationSchema = new mongoose.Schema(
  {
    userProfileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'UserProfile', // Reference to the user profile
      required: true,
    },
    institution: {
      type: String,
      trim: true,
    },
    address: {
      type: String,

      trim: true,
    },
    certificate_title: {
      type: String,
      trim: true,
    },
    attachment: {
      type: String, // URL or file path to the uploaded file (e.g., certificate PDF/image)
      trim: true,
    },
  },
  {
    versionKey: false,
    timestamps: true,
  },
);

export const Accreditation = model<IAccreditation>(
  'Accreditation',
  accreditationSchema,
);
export default Accreditation;
