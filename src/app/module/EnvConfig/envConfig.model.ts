import { Schema, model } from 'mongoose';
import { IEnvConfig } from './envConfig.interface';

const envConfigSchema = new Schema<IEnvConfig>(
    {
        key: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            uppercase: true,
        },
        value: {
            type: String,
            required: true,
        },
        group: {
            type: String,
            required: true,
            default: 'General',
        },
        type: {
            type: String,
            required: true,
            enum: ['string', 'number', 'boolean', 'url', 'email'],
            default: 'string',
        },
        isSensitive: {
            type: Boolean,
            default: false,
        },
        requiresRestart: {
            type: Boolean,
            default: false,
        },
        description: {
            type: String,
            default: '',
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        lastModifiedBy: {
            type: Schema.Types.ObjectId,
            ref: 'Admin',
        },
    },
    {
        timestamps: true,
    }
);

// Index for faster queries
envConfigSchema.index({ group: 1, isActive: 1 });

export const EnvConfig = model<IEnvConfig>('EnvConfig', envConfigSchema);
