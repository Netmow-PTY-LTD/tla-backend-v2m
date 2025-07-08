
import mongoose, { Schema, Document } from 'mongoose';

export interface IActivityLog extends Document {
  date: Date;
  activityNote: string;
  createdBy: mongoose.Types.ObjectId;
  activityType: string;
  module:string;
  extraField?: Record<string, any>; // optional dynamic object
 objectId?:mongoose.Types.ObjectId;
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
      enum: ['login', 'update', 'delete', 'create', 'other','schedule','sendsms','contact','sendemail','whatsapp','pending','archive','hired','credit_spent'], // you can adjust these
    },
     module: {
      type: String,
      required: true,
      enum: ['lead','response', 'profile', 'message', 'order', 'payment', 'admin', 'system'],
    },
    extraField: {
      type: Schema.Types.Mixed, // allows any shape
      default: {},
    },
     objectId:{
        type: Schema.Types.ObjectId, // allows any shape
    }
  },
  { timestamps: true }
);

export const ActivityLog = mongoose.model<IActivityLog>('ActivityLog', ActivityLogSchema);
