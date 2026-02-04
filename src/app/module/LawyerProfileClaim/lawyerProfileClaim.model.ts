import { Schema, model } from "mongoose";
import { ILawyerProfileClaim } from "./lawyerProfileClaim.interface";

const lawyerProfileClaimSchema = new Schema<ILawyerProfileClaim>(
    {
        claimerName: {
            type: String,
            required: true,
            trim: true,
        },
        claimerEmail: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
        },
        claimerPhone: {
            type: String,
            trim: true,
        },
        lawyerProfileEmail: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
        },
        additionalInfo: {
            type: String,
            trim: true,
        },
        claimReason: {
            type: String,
            required: true,
            trim: true,
        },
        status: {
            type: String,
            enum: ["pending", "reviewed", "approved", "rejected"],
            default: "pending",
        },
        reviewerNote: {
            type: String,
            trim: true,
        },
        reviewedBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

// Indexes
lawyerProfileClaimSchema.index({ claimerEmail: 1 });
lawyerProfileClaimSchema.index({ lawyerProfileEmail: 1 });

export const LawyerProfileClaim = model<ILawyerProfileClaim>(
    "LawyerProfileClaim",
    lawyerProfileClaimSchema
);
