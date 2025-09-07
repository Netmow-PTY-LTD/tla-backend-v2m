import { Types } from "mongoose";




export interface IVisitor {
  _id?: string;
  visitorId: Types.ObjectId;      // User who visits
  targetId: Types.ObjectId;       // Profile or resource being visited
  visitedAt?: Date;       // Timestamp
  sessionId?: string;     // Optional session ID
  deviceInfo?: {
    browser?: string;
    os?: string;
    ip?: string;
  };
}
