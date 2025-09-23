import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const lawFirmCertificationSchema = new Schema(
  {
    countryId: { type: Schema.Types.ObjectId, ref: 'Country', required: true },
    type: {
      type: String,
      required: true,
      enum: ['mandatory', 'optional'],
    },
    certificationName: { type: String, required: true },
    logo: { type: String },
  },
  { timestamps: true },
);

// Model
export const LawFirmCertification = model(
  'LawFirmCertification',
  lawFirmCertificationSchema,
);
