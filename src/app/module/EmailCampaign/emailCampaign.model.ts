import mongoose, { Document, Model, Schema } from 'mongoose';

/* ─── Sent-log sub-document ─────────────────────────────────── */
export interface ISentLogEntry {
    userId?: mongoose.Types.ObjectId;
    email: string;
    sentAt: Date;
    status: 'sent' | 'failed';
    error?: string;
}

const sentLogSchema = new Schema<ISentLogEntry>(
    {
        userId: { type: Schema.Types.ObjectId, ref: 'User' },
        email: { type: String, required: true },
        sentAt: { type: Date, default: Date.now },
        status: { type: String, enum: ['sent', 'failed'], default: 'sent' },
        error: { type: String },
    },
    { _id: false },
);

/* ─── Drip Step sub-document ────────────────────────────────── */
export interface IDripStep {
    dayOffset: number;       // number of days from campaign start
    subject: string;
    templateKey: string;
    customData: Record<string, unknown>;
}

const dripStepSchema = new Schema<IDripStep>(
    {
        dayOffset: { type: Number, required: true, min: 0 },
        subject: { type: String, required: true },
        templateKey: { type: String, required: true },
        customData: { type: Schema.Types.Mixed, default: {} },
    },
    { _id: false },
);

/* ─── User Schedule sub-document ─────────────────────────── */
export interface IUserSchedule {
    userId: mongoose.Types.ObjectId;
    scheduledAt: Date;
    status: 'pending' | 'sent' | 'failed';
    sentAt?: Date;
    error?: string;
}

const userScheduleSchema = new Schema<IUserSchedule>(
    {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        scheduledAt: { type: Date, required: true },
        status: { type: String, enum: ['pending', 'sent', 'failed'], default: 'pending' },
        sentAt: { type: Date },
        error: { type: String },
    },
    { _id: false },
);

/* ─── Daily sending stats sub-document ────────────────────── */
export interface IDailyStat {
    date: string; // YYYY-MM-DD
    count: number;
}

const dailyStatSchema = new Schema<IDailyStat>(
    {
        date: { type: String, required: true },
        count: { type: Number, default: 0 },
    },
    { _id: false },
);

/* ─── Main EmailCampaign document ──────────────────────────── */
export interface IEmailCampaign extends Document {
    title: string;
    templateKey: string;
    subject: string;
    customData: Record<string, unknown>;

    // Audience
    targetAudience: 'all_lawyers' | 'all_clients' | 'all_users' | 'specific_users' | 'segment' | 'individual_scheduled';
    targetUserIds: mongoose.Types.ObjectId[];
    userSchedules: IUserSchedule[]; // for 'individual_scheduled'
    segmentFilter: Record<string, unknown>;   // raw MongoDB filter

    // Schedule
    scheduleType: 'immediate' | 'scheduled' | 'recurring' | 'dynamic';
    scheduledAt?: Date;       // for 'scheduled'
    cronExpression?: string;  // for 'recurring'
    isActive: boolean;        // for recurring campaigns

    // Drip
    isDrip: boolean;
    dripSteps: IDripStep[];

    // Status & delivery
    status: 'draft' | 'queued' | 'sending' | 'sent' | 'failed' | 'canceled';
    sentCount: number;
    failedCount: number;
    totalTargeted: number;
    sentLog: ISentLogEntry[];
    dailyStats: IDailyStat[];  // Track how many emails sent each day
    lastRunAt?: Date;

    // Meta
    createdBy: mongoose.Types.ObjectId;
    sentAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const emailCampaignSchema = new Schema<IEmailCampaign>(
    {
        title: { type: String, required: true, trim: true },
        templateKey: { type: String, required: true, trim: true },
        subject: { type: String, required: true, trim: true },
        customData: { type: Schema.Types.Mixed, default: {} },

        // Audience
        targetAudience: {
            type: String,
            enum: ['all_lawyers', 'all_clients', 'all_users', 'specific_users', 'segment', 'individual_scheduled'],
            required: true,
            default: 'all_lawyers',
        },
        targetUserIds: [{ type: Schema.Types.ObjectId, ref: 'User' }],
        userSchedules: { type: [userScheduleSchema], default: [] },
        segmentFilter: { type: Schema.Types.Mixed, default: {} },

        // Schedule
        scheduleType: {
            type: String,
            enum: ['immediate', 'scheduled', 'recurring', 'dynamic'],
            required: true,
            default: 'immediate',
        },
        scheduledAt: { type: Date },
        cronExpression: { type: String },
        isActive: { type: Boolean, default: true },

        // Drip
        isDrip: { type: Boolean, default: false },
        dripSteps: { type: [dripStepSchema], default: [] },

        // Status & delivery
        status: {
            type: String,
            enum: ['draft', 'queued', 'sending', 'sent', 'failed', 'canceled'],
            default: 'draft',
        },
        sentCount: { type: Number, default: 0 },
        failedCount: { type: Number, default: 0 },
        totalTargeted: { type: Number, default: 0 },
        sentLog: { type: [sentLogSchema], default: [] },
        dailyStats: { type: [dailyStatSchema], default: [] },
        lastRunAt: { type: Date },

        // Meta
        createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        sentAt: { type: Date },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
    },
);

/* ─── Indexes ───────────────────────────────────────────────── */
emailCampaignSchema.index({ status: 1, scheduleType: 1 });
emailCampaignSchema.index({ scheduledAt: 1, status: 1 });
emailCampaignSchema.index({ 'userSchedules.scheduledAt': 1, 'userSchedules.status': 1 }); // Index for individual schedules
emailCampaignSchema.index({ createdBy: 1 });
emailCampaignSchema.index({ createdAt: -1 });

/* ─── Virtual: deliveryRate ─────────────────────────────────── */
emailCampaignSchema.virtual('deliveryRate').get(function (this: IEmailCampaign) {
    if (!this.totalTargeted) return 0;
    return Math.round((this.sentCount / this.totalTargeted) * 100);
});

const EmailCampaign: Model<IEmailCampaign> = mongoose.model<IEmailCampaign>(
    'EmailCampaign',
    emailCampaignSchema,
);

export default EmailCampaign;
