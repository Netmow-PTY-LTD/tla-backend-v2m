
import mongoose from "mongoose";
import { VisitorTracker } from "../models/visitorTracker.model";
import { IVisitor } from "../interfaces/visitorTracker.interface";


/**
 * Track a visit (deduplicate per day)
 */
 const trackVisit = async (visitorId:string, visitor: Partial<IVisitor>) => {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  const existingVisit = await VisitorTracker.findOneAndUpdate(
    {
      visitorId: new mongoose.Types.ObjectId(visitorId),
      targetId: new mongoose.Types.ObjectId(visitor.targetId),
      visitedAt: { $gte: startOfDay, $lte: endOfDay },
    },
    {
      $set: {
        visitedAt: new Date(),
        sessionId: visitor.sessionId,
        deviceInfo: visitor.deviceInfo,
      },
    },
    { upsert: true, new: true }
  );

  return existingVisit;
};

/**
 * Get recent visitors for a target
 */
 const getRecentVisitors = async (targetId: string, limit = 10) => {
  const visitors = await VisitorTracker.find({ targetId })
    .sort({ visitedAt: -1 })
    .limit(limit)
    .populate("visitorId", "name profile"); // adjust fields as needed

  return visitors;
};



export const  visitorTrackerService={
getRecentVisitors,
trackVisit
}