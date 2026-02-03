import mongoose, { Schema, Document, model } from 'mongoose';

export interface IEmailVerificationDraft extends Document {
    email: string;
    otp: string;
    expiresAt: Date;
    lawyerDraftId: mongoose.Types.ObjectId;
    clientDraftId: mongoose.Types.ObjectId;
    attempts: number;
    isUsed: boolean;
}

const EmailVerificationDraftSchema = new Schema<IEmailVerificationDraft>(
    {
        email: { type: String, required: true },
        otp: { type: String, required: true },
        expiresAt: { type: Date, required: true },
        lawyerDraftId: { type: Schema.Types.ObjectId, ref: 'LawyerRegistrationDraft' },
        clientDraftId: { type: Schema.Types.ObjectId, ref: 'ClientRegistrationDraft' },
        attempts: { type: Number, default: 0 },
        isUsed: { type: Boolean, default: false },
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
