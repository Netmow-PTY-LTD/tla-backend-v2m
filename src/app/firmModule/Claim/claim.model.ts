import mongoose, { Schema } from "mongoose";
import { IClaim } from "./claim.interface";


const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;
const urlRegex = /^(https?:\/\/)[^\s/$.?#].[^\s]*$/i;


const ClaimSchema = new Schema<IClaim>(
  {
    country: {
      type: Schema.Types.ObjectId,
      required: true,
      uppercase: true,
      trim: true,
      ref: "Country",
    },
    lawFirmName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 200,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      match: emailRegex,
    },
    lawFirmRegistrationNumber: {
      type: String,
      trim: true,
      maxlength: 120,
    },
    website: {
      type: String,
      trim: true,
      match: urlRegex,
    },
    knownAdminEmails: {
      type: [String],
      default: [],
      validate: {
        validator: (emails: string[]) => emails.every((e) => emailRegex.test(e)),
        message: "One or more known admin emails are invalid.",
      },
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "needs_more_info"],
      default: "pending",
      index: true,
    },
    reviewerNote: { type: String, trim: true, maxlength: 2000 },

    matchedLawFirmId: { type: Schema.Types.ObjectId, ref: "FirmProfile" },

    requesterIp: { type: String, trim: true },
    userAgent: { type: String, trim: true },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

ClaimSchema.index({ country: 1, lawFirmName: 1 });
ClaimSchema.index({ email: 1 });
ClaimSchema.index({ lawFirmName: "text" });

export const Claim = mongoose.models.Claim || mongoose.model<IClaim>("Claim", ClaimSchema);
