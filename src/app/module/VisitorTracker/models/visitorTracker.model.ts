
import mongoose, { Schema, Document } from "mongoose";
import { IVisitor } from "../interfaces/visitorTracker.interface";




const visitorTrackerSchema = new Schema<IVisitor>(
  {
    visitorId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    targetId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    visitedAt: { type: Date, default: Date.now },
    sessionId: { type: String },
    deviceInfo: {
      browser: { type: String },
      os: { type: String },
      ip: { type: String },
    },
  },
  { timestamps: true }
);

// Index for fast recent visitors and deduplication per day
visitorTrackerSchema.index({ targetId: 1, visitorId: 1, visitedAt: -1 });

export const VisitorTracker = mongoose.model<IVisitor>(
  "VisitorTracker",
  visitorTrackerSchema
);





