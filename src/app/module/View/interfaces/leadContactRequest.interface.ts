import { Document, Types } from "mongoose";

export interface ILeadContactRequest extends Document {
  leadId: Types.ObjectId;          // The lead this request is about
  requestedId: Types.ObjectId;     // The user sending the request
  toRequestId: Types.ObjectId;     // The user receiving the request
  status: 'read' | 'unread' | 'deleted';
  message?: string;               
 
}