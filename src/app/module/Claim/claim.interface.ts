import { Types } from "mongoose";

export type ClaimStatus = "pending" | "approved" | "rejected" | "needs_more_info";

export interface IClaim {
  _id?: Types.ObjectId; // optional, MongoDB will generate it
  country: Types.ObjectId; // reference to Country
  lawFirmName: string;
  lawFirmEmail: string;
  lawFirmPhone?: string;
  lawFirmRegistrationNumber?: string;
  website?: string;
  knownAdminEmails: string[];
  claimerName: string;
  claimerEmail: string;
  claimerRole: string;
  issueDescription: string;
  proofOwnFiles: string[]; // array of file paths or URLs
  status: ClaimStatus;
  reviewerNote?: string;
  matchedLawFirmId?: Types.ObjectId; // reference to FirmProfile
  requesterIp?: string;
  userAgent?: string;
  createdAt?: Date;
  updatedAt?: Date;
}