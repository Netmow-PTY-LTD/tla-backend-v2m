

import { ActivityLog } from '../models/activityLog.model';


export const getUserActivityLogs = async (userId:string) => {
  

    const logs = await ActivityLog.find({ createdBy: userId })
        .sort({ createdAt: -1 })
        .limit(50);

    return logs;
};


export const activityLogService={
    getUserActivityLogs
}