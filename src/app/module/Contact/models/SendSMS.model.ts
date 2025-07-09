
import mongoose, { Schema } from 'mongoose';

const SendSMSSchema = new Schema(
  {
    to: { type: String, required: true },
    message: { type: String, required: true },
    sentBy: { type: Schema.Types.ObjectId, ref: 'UserProfile', required: true },
    responseId: { type: Schema.Types.ObjectId, ref: 'Response' }, // optional
    leadId: { type: Schema.Types.ObjectId, ref: 'Lead' }, // optional
    provider: { type: String, enum: ['twilio', 'sslwireless', 'nexmo'], default: 'twilio' },
    status: { type: String, enum: ['sent', 'failed'], default: 'sent' },
    error: { type: String }, // in case sending failed
    metadata: { type: Schema.Types.Mixed }, // optional: for storing provider's raw response
  },
  {
    timestamps: true,
  }
);

export const SendSMS = mongoose.model('SendSMS', SendSMSSchema);
