import { Types } from "mongoose";

export type ClaimStatus = "pending" | "reviewed" | "approved" | "rejected";

export interface ILawyerProfileClaim {
    _id?: Types.ObjectId;
    claimerName: string;
    claimerEmail: string;
    claimerPhone?: string;
    profileId: Types.ObjectId; // The UserProfile being claimed
    additionalInfo?: string;
    claimReason: string;
    status: ClaimStatus;
    reviewerNote?: string;
    reviewedBy?: Types.ObjectId;
    createdAt?: Date;
    updatedAt?: Date;
}
