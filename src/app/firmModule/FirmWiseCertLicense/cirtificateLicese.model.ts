
import { Schema, model, Types } from "mongoose";



// Firm-specific license
const firmLicenseSchema = new Schema(
  {
    firmProfileId: { type: Schema.Types.ObjectId, ref: "FirmProfile", required: true }, // link to firm
    certificationId: { type: Schema.Types.ObjectId, ref: "LawFirmCertification", required: true }, // reference to certification type
    licenseNumber: { type: String, required: true }, // firm's license number
    issuedBy: { type: String, default: '' }, // issuing authority
    additionalNote: { type: String, default: '' }, // issuing authority
    validUntil: { type: Date, required: true }, // expiration date
    type: {
      type: String,
      enum: ['mandatory', 'optional'],
      required: true,
    }, // license type
  },
  { timestamps: true }
);

// Model
export const FirmLicense = model("FirmLicense", firmLicenseSchema);
