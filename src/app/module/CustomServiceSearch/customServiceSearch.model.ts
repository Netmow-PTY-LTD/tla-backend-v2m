import mongoose, { Schema, Document } from 'mongoose';

export interface ICustomServiceSearch extends Document {
    searchTerm: string;
    source: 'lead' | 'draft' | 'anonymous';
    countryId?: mongoose.Types.ObjectId;
    serviceId?: mongoose.Types.ObjectId;
    leadId?: mongoose.Types.ObjectId;
    draftId?: mongoose.Types.ObjectId;
    sessionId?: string;
    createdAt: Date;
    updatedAt: Date;
}

const customServiceSearchSchema = new Schema<ICustomServiceSearch>(
    {
        searchTerm: {
            type: String,
            required: true,
            trim: true,
            index: true,
        },
        source: {
            type: String,
            enum: ['lead', 'draft', 'anonymous'],
            default: 'anonymous',
            index: true,
        },
        countryId: {
            type: Schema.Types.ObjectId,
            ref: 'Country',
            default: null,
            index: true,
        },
        serviceId: {
            type: Schema.Types.ObjectId,
            ref: 'Service',
            default: null,
        },
        leadId: {
            type: Schema.Types.ObjectId,
            ref: 'Lead',
            default: null,
        },
        draftId: {
            type: Schema.Types.ObjectId,
            ref: 'ClientRegistrationDraft',
            default: null,
        },
        sessionId: {
            type: String,
            default: null,
        },
    },
    {
        timestamps: true,
        collection: 'custom_service_searches',
        versionKey: false,
    },
);

// Compound index for analytics filtering
customServiceSearchSchema.index({ source: 1, createdAt: -1 });
customServiceSearchSchema.index({ countryId: 1, createdAt: -1 });
customServiceSearchSchema.index({ searchTerm: 'text' });

const CustomServiceSearch = mongoose.model<ICustomServiceSearch>(
    'CustomServiceSearch',
    customServiceSearchSchema,
);

export default CustomServiceSearch;
