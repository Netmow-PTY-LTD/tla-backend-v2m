import { Schema } from 'mongoose';

export interface IEmailTemplateCategory {
    name: string;
    description?: string;
    isActive: boolean;
    createdBy: Schema.Types.ObjectId;
}

export interface IEmailTemplate {
    title: string;                  // Internal title (Admin use)
    templateKey: string;           // Unique identifier (e.g. welcome_lawyer)
    target: 'client' | 'lawyer' | 'firm';           // Type of template (e.g. client, lawyer, firm)
    categoryId: Schema.Types.ObjectId;               // Reference to EmailTemplateCategory
    subject: string;               // Subject line (supports variables)
    body: string;                  // HTML or plain text
    variables: string[];           // Allowed variables
    isActive: boolean;
    createdBy: Schema.Types.ObjectId;
}
