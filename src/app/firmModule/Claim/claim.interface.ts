import { Types } from "mongoose";

export type ClaimStatus = "pending" | "approved" | "rejected" | "needs_more_info";

export interface IClaim {
  _id: Types.ObjectId;

  country: string;
  lawFirmName: string;
  email: string;
  lawFirmRegistrationNumber?: string;
  website?: string;
  knownAdminEmails: string[];

  status: ClaimStatus;
  reviewerNote?: string;
  matchedLawFirmId?: Types.ObjectId;

  requesterIp?: string;
  userAgent?: string;

  createdAt: Date;
  updatedAt: Date;
}
