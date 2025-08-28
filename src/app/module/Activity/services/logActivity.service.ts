

import { getIO } from '../../../sockets';
import User from '../../Auth/models/auth.model';
import CreditTransaction from '../../CreditPayment/models/creditTransaction.model';
import Transaction from '../../CreditPayment/models/transaction.model';
import Lead from '../../Lead/models/lead.model';
import LeadResponse from '../../LeadResponse/models/response.model';
import { createNotification } from '../../Notification/utils/createNotification';
import { ProfileVisitor } from '../../VisitorTracker/models/profileVisitor.model';
import { ActivityLog } from '../models/activityLog.model';


export const getUserActivityLogs = async (userId: string) => {


    const logs = await ActivityLog.find({ createdBy: userId })
        .sort({ createdAt: -1 })
        .limit(50);

    return logs;
};



const requiredFields = ['activityNote', 'activityType', 'module'];


// const createUserActivityLogs = async (userId: string, payload: any) => {
//     const io = getIO();

//     // Validate required fields
//     for (const field of requiredFields) {
//         if (!payload[field]) {
//             return null;
//         }
//     }

//     const activity = await ActivityLog.create({
//         createdBy: userId,
//         activityNote: payload.activityNote,
//         activityType: payload.activityType,
//         module: payload.module,
//         extraField: payload.extraField || {},
//         objectId: payload.objectId || undefined,
//     });

//     // ✅ Optional notification trigger
//     if (payload.notify !== false) {
//         const notificationTitle = payload.notificationTitle || 'Activity Logged';
//         const notificationMessage =
//             payload.notificationMessage || payload.activityNote;
//         const link = payload.link || null;

//         await createNotification({
//             userId,        //  next it will change of to user logic
//             toUser: payload.toUser,
//             title: notificationTitle,
//             message: notificationMessage,
//             module: payload.module || 'general',       // Use activity module or fallback
//             type: payload.activityType || 'other',     // Use activity type or fallback
//             link,
//         });

//         await createNotification({
//             userId: payload.toUser,       //  next it will change of to user logic
//             toUser: userId,
//             title: notificationTitle,
//             message: notificationMessage,
//             module: payload.module || 'general',       // Use activity module or fallback
//             type: payload.activityType || 'other',     // Use activity type or fallback
//             link,
//         });

//         io.to(`user:${payload.toUser}`).emit('notification', {
//             userId,
//             toUser: payload.toUser,
//             title: notificationTitle,
//             message: notificationMessage,
//             module: payload.module || 'general',       // Use activity module or fallback
//             type: payload.activityType || 'other',     // Use activity type or fallback
//             link,
//         });

//         io.to(`user:${userId}`).emit('notification', {
//             userId: payload.toUser,
//             toUser: userId,
//             title: notificationTitle,
//             message: notificationMessage,
//             module: payload.module || 'general',       // Use activity module or fallback
//             type: payload.activityType || 'other',     // Use activity type or fallback
//             link,
//         });


//     }



//     return activity;
// };




const createUserActivityLogs = async (userId: string, payload: any) => {
  const io = getIO();

  // Validate required fields
  for (const field of requiredFields) {
    if (!payload[field]) {
      return null;
    }
  }

  // Create the activity log
  const activity = await ActivityLog.create({
    createdBy: userId,
    activityNote: payload.activityNote,
    activityType: payload.activityType,
    module: payload.module,
    extraField: payload.extraField || {},
    objectId: payload.objectId || undefined,
  });

  // Trigger notification unless explicitly disabled
  if (payload.notify !== false) {
    const {
      notificationTitle = payload.activityNote||'Activity Logged',
      notificationMessage = payload.activityNote,
      link = null,
      toUser,
    } = payload;

    const notificationPayload = {
      title: notificationTitle,
      message: notificationMessage,
      module: payload.module || 'general',
      type: payload.activityType || 'other',
      link,
    };

    // Create notification for the recipient
    await createNotification({
      userId,          // sender ID
      toUser,
      ...notificationPayload,
    });

    // Create notification for the sender
    await createNotification({
      userId: toUser,   // recipient becomes sender
      toUser: userId,
      ...notificationPayload,
    });

    // Emit socket notifications to both users
    io.to(`user:${toUser}`).emit('notification', {
      userId,
      toUser,
      ...notificationPayload,
    });

    io.to(`user:${userId}`).emit('notification', {
      userId: toUser,
      toUser: userId,
      ...notificationPayload,
    });
  }

  return activity;
};




//   lawyer details api service logic 


const getLawyerDetailsLogFromDB = async (lawyerId: string) => {
  // 1️⃣ Fetch lawyer user with profile & payment methods populated
  const lawyer = await User.findOne({ _id: lawyerId, regUserType: "lawyer" })
    .populate({
      path: "profile",
      populate: [
        { path: "country", select: "name" },
        { path: "zipCode", select: "code" },
        { path: "serviceIds", select: "name" },
        {
          path: "paymentMethods", // 🔹 Populate payment methods details
          select: "methodName provider accountNumber status createdAt",
        },
      ],
    });

  if (!lawyer) {
    return null;
  }

  const profileId = lawyer.profile?._id;

  // 2️⃣ Fetch lead responses
  const responses = await LeadResponse.find({ responseBy: profileId })
    .populate("leadId")
    .populate("serviceId")
    .lean();

  // 3️⃣ Fetch leads where lawyer got hired
  const hiredLeads = await Lead.find({ hiredLawyerId: profileId })
    .populate("serviceId")
    .populate("userProfileId")
    .lean();

  // 4️⃣ Fetch credits transactions
  const creditTransactions = await CreditTransaction.find({ userProfileId: profileId }).sort({ createdAt: -1 });

  // 5️⃣ Fetch purchases & usage transactions
  const transactions = await Transaction.find({ userId: lawyer._id }).sort({ createdAt: -1 });

  // 6️⃣ Profile visitors
  const profileVisitors = await ProfileVisitor.find({ targetId: profileId })
    .populate("visitorId", "email role")
    .sort({ visitedAt: -1 });

  // ✅ Structured result for admin
  return {
    lawyer,
    profile: lawyer.profile,
    services: lawyer.profile?.serviceIds,
    paymentMethods: lawyer.profile?.paymentMethods || [], // 🔹 Include payment methods here
    credits: {
      totalCredits: lawyer.profile?.credits || 0,
      transactions: creditTransactions,
    },
    transactions,
    responses,
    hiredLeads,
    profileVisitors,
  };
};















export const activityLogService = {
    getUserActivityLogs,
    createUserActivityLogs,
    getLawyerDetailsLogFromDB
}