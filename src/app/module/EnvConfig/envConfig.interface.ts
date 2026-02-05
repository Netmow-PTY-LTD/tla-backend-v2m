import { Document, Types } from 'mongoose';

export interface IEnvConfig extends Document {
    key: string;
    value: string;
    group: string;
    type: string;
    isSensitive: boolean;
    requiresRestart: boolean;
    description: string;
    isActive: boolean;
    lastModifiedBy?: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

export interface IEnvConfigUpdate {
    key: string;
    value: string;
}

export interface IEnvConfigGrouped {
    [group: string]: {
        key: string;
        value: string;
        type: string;
        isSensitive: boolean;
        requiresRestart: boolean;
        description: string;
        isActive: boolean;
    }[];
}
