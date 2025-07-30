

import { getIO } from '../../../sockets';
import { createNotification } from '../../Notification/utils/createNotification';
import { ActivityLog } from '../models/activityLog.model';


export const getUserActivityLogs = async (userId: string) => {


    const logs = await ActivityLog.find({ createdBy: userId })
        .sort({ createdAt: -1 })
        .limit(50);

    return logs;
};



const requiredFields = ['activityNote', 'activityType', 'module'];


const createUserActivityLogs = async (userId: string, payload: any) => {
    const io = getIO();

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

    // ✅ Optional notification trigger
    if (payload.notify !== false) {
        const notificationTitle = payload.notificationTitle || 'Activity Logged';
        const notificationMessage =
            payload.notificationMessage || payload.activityNote;
        const link = payload.link || null;

        await createNotification({
            userId,
            //  next it will change of to user logic
            toUser: payload.toUser,
            title: notificationTitle,
            message: notificationMessage,
            module: payload.module || 'general',       // Use activity module or fallback
            type: payload.activityType || 'other',     // Use activity type or fallback
            link,
        });

        io.to(`user:${payload.toUser}`).emit('notification', {
            userId,
            toUser: payload.toUser,
            title: notificationTitle,
            message: notificationMessage,
            module: payload.module || 'general',       // Use activity module or fallback
            type: payload.activityType || 'other',     // Use activity type or fallback
            link,
        });






    }



    return activity;
};


export const activityLogService = {
    getUserActivityLogs,
    createUserActivityLogs
}