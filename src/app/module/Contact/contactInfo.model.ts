import { Schema, model, Document } from 'mongoose';

export interface IContactInfo extends Document {
    address: string;
    phone: string;
    email: string;
    website?: string;
    updatedAt: Date;
    createdAt: Date;
}

const ContactInfoSchema = new Schema<IContactInfo>(
    {
        address: {
            type: String,
            required: true,
            trim: true,
        },
        phone: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
        },
        website: {
            type: String,
            trim: true,
        },
    },
    {
        timestamps: true,
    }
);

export const ContactInfo = model<IContactInfo>(
    'ContactInfo',
    ContactInfoSchema
);
