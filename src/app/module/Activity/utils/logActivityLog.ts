import { Types } from "mongoose";
import { ActivityLog } from "../models/activityLog.model";


export const logActivity = async ({
  createdBy,
  activityNote,
  activityType,
  module,
  extraField = {},
  objectId
}: {
  createdBy: string;
  activityNote: string;
  activityType: string;
  module: string;
  extraField?: Record<string, any>;
   objectId:Types.ObjectId
}) => {
  try {
    await ActivityLog.create({
      date: new Date(),
      createdBy,
      activityNote,
      activityType,
      module,
      extraField,
      objectId
    });
  } catch (err) {
    console.error('Activity log error:', err);
  }
};


//uses example

// await logActivity({
//   createdBy: userId,
//   activityNote: 'Viewed lead details',
//   activityType: 'view',
//   module: 'lead',
//   extraField: { leadId },
// });