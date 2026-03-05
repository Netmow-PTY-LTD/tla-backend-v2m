import { Schema } from 'mongoose';

export interface IEmailTemplate {
    title: string;                  // Internal title (Admin use)
    templateKey: string;           // Unique identifier (e.g. welcome_lawyer)
    target: 'client' | 'lawyer' | 'firm';           // Type of template (e.g. client, lawyer, firm)
    subject: string;               // Subject line (supports variables)
    body: string;                  // HTML or plain text
    variables: string[];           // Allowed variables
    isActive: boolean;
    createdBy: Schema.Types.ObjectId;
}
