import mongoose, { model } from 'mongoose';
import { IAccreditation } from '../interfaces/profileAccreditatio';

const accreditationSchema = new mongoose.Schema(
  {
    userProfileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'UserProfile', // Reference to the user profile
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    attachment: {
      type: String, // URL or file path to the uploaded file (e.g., certificate PDF/image)
      required: true,
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
