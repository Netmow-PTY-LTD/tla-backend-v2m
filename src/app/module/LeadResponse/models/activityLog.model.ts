
import mongoose, { Schema, Document } from 'mongoose';

export interface IActivityLog extends Document {
  date: Date;
  activityNote: string;
  createdBy: mongoose.Types.ObjectId;
  activityType: string;
  extraField?: Record<string, any>; // optional dynamic object
}

const ActivityLogSchema = new Schema<IActivityLog>(
  {
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    activityNote: {
      type: String,
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    activityType: {
      type: String,
      required: true,
    //   enum: ['login', 'update', 'delete', 'create', 'other'], // you can adjust these
    },
    extraField: {
      type: Schema.Types.Mixed, // allows any shape
      default: {},
    },
  },
  { timestamps: true }
);

export const ActivityLog = mongoose.model<IActivityLog>('ActivityLog', ActivityLogSchema);
