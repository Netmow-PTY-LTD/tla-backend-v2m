
import mongoose, { Schema } from 'mongoose';

const SendEmailSchema = new Schema(
  {
    to: { type: String, required: true },
    subject: { type: String, required: true },
    html: { type: String }, // optional: you can store raw HTML if needed
    text: { type: String }, // optional: plain version
    sentBy: { type: Schema.Types.ObjectId, ref: 'UserProfile', required: true },
    responseId: { type: Schema.Types.ObjectId, ref: 'Response' }, // optional
    leadId: { type: Schema.Types.ObjectId, ref: 'Lead' }, // optional
    status: { type: String, enum: ['sent', 'failed'], default: 'sent' },
    error: { type: String }, // store failure reason if any
  },
  {
    timestamps: true,
  }
);

export const SendEmail = mongoose.model('SendEmail', SendEmailSchema);