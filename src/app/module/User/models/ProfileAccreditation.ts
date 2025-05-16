import mongoose from 'mongoose';

const accreditationSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CompanyProfile',
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
    timestamps: true,
  },
);

export default mongoose.model('Accreditation', accreditationSchema);
