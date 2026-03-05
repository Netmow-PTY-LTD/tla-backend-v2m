import { Schema, model, Types } from 'mongoose';

export interface IEmailQueue {
    userId: Types.ObjectId;
    email: string;
    templateKey: string;
    scheduledAt: Date;
    status: 'pending' | 'sent' | 'failed';
    sentAt?: Date;
    retryCount: number;
}

const emailQueueSchema = new Schema<IEmailQueue>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        email: {
            type: String,
            required: true,
            trim: true,
        },
        templateKey: {
            type: String,
            required: true,
        },
        scheduledAt: {
            type: Date,
            required: true,
            index: true,
        },
        status: {
            type: String,
            enum: ['pending', 'sent', 'failed'],
            default: 'pending',
            index: true,
        },
        sentAt: {
            type: Date,
        },
        retryCount: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);

// Compound index if needed for scheduler
emailQueueSchema.index({ scheduledAt: 1, status: 1 });

export const EmailQueue = model<IEmailQueue>('EmailQueue', emailQueueSchema);
