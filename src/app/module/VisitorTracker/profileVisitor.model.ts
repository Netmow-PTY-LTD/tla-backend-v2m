import mongoose, { Schema } from "mongoose";
import { Document } from "mongoose";


export interface ProfileVisitorDoc extends Document {
  visitorId: mongoose.Types.ObjectId;
  targetId: mongoose.Types.ObjectId;
  visitedAt: Date;
}

const profileVisitorSchema = new Schema<ProfileVisitorDoc>(
  {
    visitorId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    targetId: { type: Schema.Types.ObjectId, ref: "UserProfile", required: true }, // profile
    visitedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Index for fast queries and deduplication per day
profileVisitorSchema.index({ targetId: 1, visitorId: 1, visitedAt: -1 });

export const ProfileVisitor = mongoose.model<ProfileVisitorDoc>(
  "ProfileVisitor",
  profileVisitorSchema
);
