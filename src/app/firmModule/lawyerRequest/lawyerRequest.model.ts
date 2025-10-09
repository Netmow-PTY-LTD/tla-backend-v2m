import { Schema, model, Types, Document } from 'mongoose';

export interface ILawyerRequestAsMember extends Document {
  firmProfileId: Types.ObjectId; // Reference to LawFirm profile
  lawyerId: Types.ObjectId; // Reference to Lawyer user profile
  status: 'pending' | 'approved' | 'rejected' | 'cancelled' | 'left';
  message?: string; // Lawyer’s message to the firm
  reviewedBy?: Types.ObjectId; // Admin or firm user who reviewed
  reviewedAt?: Date;
  rejectionReason?: string;
  isActive: boolean; // Soft delete / archive
  createdAt: Date;
  updatedAt: Date;
  cancelBy?: Types.ObjectId; // Reference to User who canceled the request
  cancelAt?: Date; // Timestamp when the request was canceled
}

const lawyerRequestAsMemberSchema = new Schema<ILawyerRequestAsMember>(
  {
    firmProfileId: {
      type: Schema.Types.ObjectId,
      ref: 'FirmProfile',
      required: true,
      index: true,
    },
    lawyerId: {
      type: Schema.Types.ObjectId,
      ref: 'UserProfile', // or 'LawyerProfile' depending on your structure
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'cancelled', 'left'],
      default: 'pending',
    },
    message: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: 'FirmUser', 
    },
    reviewedAt: {
      type: Date,
    },
    rejectionReason: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    cancelBy: {
      type: Schema.Types.ObjectId,
      ref: 'UserProfile',
    },
    cancelAt: {
      type: Date,
    },
  },
  {
    timestamps: true, // adds createdAt & updatedAt
    versionKey: false,
  }
);




export const LawyerRequestAsMember = model<ILawyerRequestAsMember>(
  'LawyerRequestAsMember',
  lawyerRequestAsMemberSchema
);
