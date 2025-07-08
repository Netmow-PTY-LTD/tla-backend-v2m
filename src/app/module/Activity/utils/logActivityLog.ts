
import { Types, ClientSession } from 'mongoose';
import { ActivityLog } from '../models/activityLog.model';


export const logActivity = async ({
  createdBy,
  activityNote,
  activityType,
  module,
  extraField = {},
  objectId,
  session = null,
}: {
  createdBy: string | Types.ObjectId;
  activityNote: string;
  activityType: string;
  module: string;
  extraField?: Record<string, any>;
  objectId: string | Types.ObjectId;
  session?: ClientSession | null;
}) => {
  try {
    await ActivityLog.create(
      [
        {
          date: new Date(),
          createdBy,
          activityNote,
          activityType,
          module,
          extraField,
          objectId,
        },
      ],
      session ? { session } : undefined
    );
  } catch (err) {
    console.error('Activity log error:', err);
  }
};



/* 
//uses example


 //With Session (inside transaction)

await logActivity({
  createdBy: userId,
  activityNote: 'Spent 5 credits to contact a lead',
  activityType: 'credit_spent',
  module: 'response',
  objectId: responseId,
  extraField: { creditSpent: 5 },
  session,
});


Without Session (outside transaction)

await logActivity({
  createdBy: userId,
  activityNote: 'Logged in',
  activityType: 'login',
  module: 'system',
  extraField: { creditSpent: 5 },
  objectId: userId,
});

*/