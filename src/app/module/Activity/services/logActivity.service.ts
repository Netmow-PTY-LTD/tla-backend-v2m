

import { ActivityLog } from '../models/activityLog.model';


export const getUserActivityLogs = async (userId: string) => {


    const logs = await ActivityLog.find({ createdBy: userId })
        .sort({ createdAt: -1 })
        .limit(50);

    return logs;
};



const requiredFields = ['activityNote', 'activityType', 'module'];

const createUserActivityLogs = async (userId: string, payload: any) => {
    // Validate required fields
    for (const field of requiredFields) {
        if (!payload[field]) {
            return null;
        }
    }

    const activity = await ActivityLog.create({
        createdBy: userId,
        activityNote: payload.activityNote,
        activityType: payload.activityType,
        module: payload.module,
        extraField: payload.extraField || {},
        objectId: payload.objectId || undefined,
    });

    return activity;
};


export const activityLogService = {
    getUserActivityLogs,
    createUserActivityLogs
}