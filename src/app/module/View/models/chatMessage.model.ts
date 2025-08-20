import { Schema, model, Document } from 'mongoose';

export interface IResponseWiseChatMessage extends Document {
  responseId: Schema.Types.ObjectId; // Which lead/response this message belongs to
  from: Schema.Types.ObjectId;       // User who sent the message
  to: Schema.Types.ObjectId;       // User who sent the message
  message: string;                   // The text content
  readBy: Schema.Types.ObjectId[]; // <-- new field
  createdAt: Date;
  updatedAt: Date;
}

const chatMessageSchema = new Schema<IResponseWiseChatMessage>(
  {
    responseId: {
      type: Schema.Types.ObjectId,
      ref: 'LeadResponse', // or your actual response collection
      required: true,
    },
    from: {
      type: Schema.Types.ObjectId,
      ref: 'User', // reference to your User model
      required: true,
    },
    to: {
      type: Schema.Types.ObjectId,
      ref: 'User', // reference to your User model
      required: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    readBy: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    timestamps: true, // auto-manage createdAt, updatedAt
  }
);

export const ResponseWiseChatMessage = model<IResponseWiseChatMessage>('ResponseWiseChatMessage', chatMessageSchema);
