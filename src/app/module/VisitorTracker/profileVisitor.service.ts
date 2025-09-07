// modules/profileVisitor/profileVisitor.service.ts
import mongoose from "mongoose";
import { ProfileVisitor } from "./profileVisitor.model";

/**
 * Track a visit (deduplicate per day)
 */

const trackVisit = async (visitorId: string, targetId: string) => {
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
const getRecentVisitors = async (targetId: string, limit = 10) => {
    const visitors = await ProfileVisitor.find({ targetId })
        .sort({ visitedAt: -1 }) // Latest first
        .limit(limit)
        .populate({
            path: "visitorId", // Populate visitor info from User collection
            select: "email role regUserType profile", // Only fetch minimal user info
            populate: {
                path: "profile", // Populate UserProfile details
                model: "UserProfile",
                select: "name slug profilePicture designation avgRating totalRatings", // Fetch only useful fields
            },
        })
        .select("visitorId visitedAt");



    return visitors;
};



export const profileVistorService = {
    getRecentVisitors,
    trackVisit
}


