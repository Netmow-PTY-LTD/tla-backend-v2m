import mongoose, { Schema, Document, model } from 'mongoose';

export interface ISsoToken extends Document {
    token: string;          // One-time token value
    adminId?: mongoose.Types.ObjectId; // Optional admin who created the token
    staffId: mongoose.Types.ObjectId; // Staff who generated the token
    lawyerId: mongoose.Types.ObjectId; // Target lawyer
    expiresAt: Date;        // Expiration date
    used: boolean;          // Whether token is already used
    createdAt: Date;
    updatedAt: Date;
}

const ssoTokenSchema: Schema<ISsoToken> = new Schema(
    {
        token: { type: String, required: true, unique: true },
        adminId: { type: Schema.Types.ObjectId, ref: 'FirmUser', }, // new field
        staffId: { type: Schema.Types.ObjectId, ref: 'FirmUser', },
        lawyerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        expiresAt: { type: Date, required: true },
        used: { type: Boolean, default: false },
    },
    { timestamps: true }
);

// Optional: Automatically remove expired tokens (cleanup)
ssoTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const SsoToken = model<ISsoToken>('SsoToken', ssoTokenSchema);
