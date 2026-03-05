

import { Schema, model } from 'mongoose';
import { IEmailTemplate } from './emailTemplate.interface';

const emailTemplateSchema = new Schema<IEmailTemplate>(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },
        templateKey: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        target: {
            type: String,
            enum: ['client', 'lawyer', 'firm'],
            required: true,
        },
        subject: {
            type: String,
            required: true,
        },
        body: {
            type: String,
            required: true,
        },
        variables: [
            {
                type: String,
            },
        ],
        isActive: {
            type: Boolean,
            default: true,
        },
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: 'User',
        },
    },
    {
        timestamps: true,
    }
);

export const EmailTemplate = model<IEmailTemplate>(
    'EmailTemplate',
    emailTemplateSchema
);