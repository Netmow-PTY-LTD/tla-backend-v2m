import { ActivityLog } from "../models/activityLog.model";


export const logActivity = async ({
  createdBy,
  activityNote,
  activityType,
  module,
  extraField = {},
}: {
  createdBy: string;
  activityNote: string;
  activityType: string;
  module: string;
  extraField?: Record<string, any>;
}) => {
  try {
    await ActivityLog.create({
      date: new Date(),
      createdBy,
      activityNote,
      activityType,
      module,
      extraField,
    });
  } catch (err) {
    console.error('Activity log error:', err);
  }
};