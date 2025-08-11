import { Schema, model } from 'mongoose';
import { ILeadContactRequest } from '../interfaces/leadContactRequest.interface';



const leadContactRequestSchema = new Schema<ILeadContactRequest>(
  {
    leadId: {
      type: Schema.Types.ObjectId,
      ref: 'Lead',
      required: true,
    },
    requestedId: {
      type: Schema.Types.ObjectId,
      ref: 'UserProfile', 
      required: true,
    },
    toRequestId: {
      type: Schema.Types.ObjectId,
      ref: 'UserProfile',
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending',
    },
    message: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

export const LeadContactRequest = model<ILeadContactRequest>(
  'LeadContactRequest',
  leadContactRequestSchema
);
