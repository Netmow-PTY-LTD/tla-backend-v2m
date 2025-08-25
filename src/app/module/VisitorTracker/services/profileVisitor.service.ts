// modules/profileVisitor/profileVisitor.service.ts
import mongoose from "mongoose";
import { ProfileVisitor } from "../models/profileVisitor.model";

/**
 * Track a visit (deduplicate per day)
 */
export const trackVisit = async (visitorId: string, targetId: string) => {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  const existingVisit = await ProfileVisitor.findOneAndUpdate(
    {
      visitorId: new mongoose.Types.ObjectId(visitorId),
      targetId: new mongoose.Types.ObjectId(targetId),
      visitedAt: { $gte: startOfDay, $lte: endOfDay },
    },
    { $set: { visitedAt: new Date() } },
    { upsert: true, new: true }
  );

  return existingVisit;
};

/**
 * Get recent visitors for a profile
 */
export const getRecentVisitors = async (targetId: string, limit = 10) => {
  const visitors = await ProfileVisitor.find({ targetId })
    .sort({ visitedAt: -1 })
    .limit(limit)
    .populate("visitorId", "name profile"); // adjust fields as needed

  return visitors;
};



export const  profileVistorService={
getRecentVisitors,
trackVisit
}


