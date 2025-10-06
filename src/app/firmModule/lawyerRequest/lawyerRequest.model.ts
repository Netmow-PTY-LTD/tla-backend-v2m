import { Schema, model, Types, Document } from 'mongoose';

export interface ILawyerRequestAsMember extends Document {
  firmProfileId: Types.ObjectId; // Reference to LawFirm profile
  lawyerId: Types.ObjectId; // Reference to Lawyer user profile
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  message?: string; // Lawyer’s message to the firm
  reviewedBy?: Types.ObjectId; // Admin or firm user who reviewed
  reviewedAt?: Date;
  rejectionReason?: string;
  isActive: boolean; // Soft delete / archive
  createdAt: Date;
  updatedAt: Date;
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
      enum: ['pending', 'approved', 'rejected', 'cancelled'],
      default: 'pending',
    },
    message: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
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
  },
  {
    timestamps: true, // adds createdAt & updatedAt
    versionKey: false,
  }
);

// Optional compound index to prevent duplicate pending requests
lawyerRequestAsMemberSchema.index(
  { firmProfileId: 1, lawyerId: 1, status: 1 },
  { unique: true, partialFilterExpression: { status: 'pending' } }
);

export const LawyerRequestAsMember = model<ILawyerRequestAsMember>(
  'LawyerRequestAsMember',
  lawyerRequestAsMemberSchema
);
