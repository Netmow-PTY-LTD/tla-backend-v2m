import mongoose, { Schema, Document, model } from 'mongoose';

export interface IEmailVerificationDraft extends Document {
    email: string;
    otp: string;
    expiresAt: Date;
    lawyerDraftId: mongoose.Types.ObjectId;
}

const EmailVerificationDraftSchema = new Schema<IEmailVerificationDraft>(
    {
        email: { type: String, required: true },
        otp: { type: String, required: true },
        expiresAt: { type: Date, required: true },
        lawyerDraftId: { type: Schema.Types.ObjectId, ref: 'LawyerRegistrationDraft' },
    },
    {
        timestamps: true,
        collection: 'email_verification_drafts'
    }
);

export const EmailVerificationDraft = model<IEmailVerificationDraft>(
    'EmailVerificationDraft',
    EmailVerificationDraftSchema
);
