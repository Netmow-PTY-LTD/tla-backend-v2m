/* eslint-disable @typescript-eslint/no-explicit-any */
import mongoose from 'mongoose';
import EmailCampaign, { IEmailCampaign } from './emailCampaign.model';
import UserProfile from '../User/user.model';
import { sendEmail } from '../../emails/email.service';
import { AppError } from '../../errors/error';
import { HTTP_STATUS } from '../../constant/httpStatus';

/* ──────────────────────────────────────────────────────────────────
   AVAILABLE TEMPLATE KEYS
   Keep in sync with email.service.ts
────────────────────────────────────────────────────────────────── */
export const AVAILABLE_TEMPLATE_KEYS = [
    // Auth
    { key: 'welcome_to_lawyer', label: 'Welcome – Lawyer' },
    { key: 'welcome_to_client', label: 'Welcome – Client' },
    { key: 'welcome_to_lawyer_by_marketer', label: 'Welcome – Lawyer (by Marketer)' },
    { key: 'verify_email', label: 'Email Verification' },
    { key: 'password_reset', label: 'Password Reset' },
    { key: 'otp_email', label: 'OTP Code' },
    { key: 'lawyer_approved', label: 'Lawyer Account Approved' },
    { key: 'lawyerPromotion', label: 'Lawyer Profile Promotion' },
    // Lead
    { key: 'new_lead_alert', label: 'New Lead Alert (Lawyer)' },
    { key: 'welcome_Lead_submission', label: 'Lead Submitted (Client)' },
    // Contact
    { key: 'contact', label: 'Lawyer–Client Interaction' },
    { key: 'public-contact', label: 'Public Contact Form' },
    // Firm
    { key: 'firm_password_reset', label: 'Firm – Password Reset' },
    { key: 'firm_registration', label: 'Firm – Registration' },
    { key: 'new_claim_notification', label: 'New Claim Notification' },
    { key: 'request_lawyer_as_firm_member', label: 'Firm – Invite Lawyer' },
    // Subscription
    { key: 'subscription_created', label: 'Subscription Created' },
    { key: 'subscription_renewed', label: 'Subscription Renewed' },
    { key: 'subscription_payment_failed', label: 'Subscription Payment Failed' },
    { key: 'subscription_canceled', label: 'Subscription Canceled' },
    { key: 'subscription_changed', label: 'Subscription Plan Changed' },
    { key: 'subscription_renewal_reminder', label: 'Subscription Renewal Reminder' },
    { key: 'subscription_expired', label: 'Subscription Expired' },
    // Credits
    { key: 'credits_purchased', label: 'Credits Purchased' },
    { key: 'credits_low_warning', label: 'Low Credits Warning' },
    // Admin custom
    { key: 'admin_custom', label: 'Custom Admin Message' },
];

/* ──────────────────────────────────────────────────────────────────
   BUILT-IN SEGMENT PRESETS
────────────────────────────────────────────────────────────────── */
export const SEGMENT_PRESETS = [
    { id: 'lawyers_zero_credits', label: 'Lawyers with 0 credits', filter: { role: 'lawyer', credits: { $lte: 0 } } },
    { id: 'expiring_subscriptions', label: 'Subscriptions expiring in 7 days', filter: { role: 'lawyer' } }, // refined in service
    { id: 'inactive_clients_30d', label: 'Clients inactive for 30+ days', filter: { role: 'client' } },
    { id: 'unverified_lawyers', label: 'Lawyers not yet verified', filter: { role: 'lawyer', profileType: 'basic' } },
    { id: 'elite_pro_subscribers', label: 'Elite Pro subscribers', filter: { role: 'lawyer', isElitePro: true } },
];

/* ──────────────────────────────────────────────────────────────────
   HELPERS
────────────────────────────────────────────────────────────────── */

/**
 * Resolve target user emails based on campaign audience settings
 */
/**
 * Resolve target user emails based on campaign audience settings
 */
const resolveTargetUsers = async (campaign: IEmailCampaign): Promise<{ userId: any; email: string; name: string }[]> => {
    const { targetAudience, targetUserIds, segmentFilter, userSchedules } = campaign;

    if (targetAudience === 'individual_scheduled') {
        const now = new Date();
        // Only get users whose scheduled time has passed and not yet sent
        const pending = userSchedules.filter(s => s.status === 'pending' && s.scheduledAt <= now);
        if (pending.length === 0) return [];

        const pendingUserIds = pending.map(s => s.userId);
        const profiles = await UserProfile.find({ user: { $in: pendingUserIds } })
            .populate<{ user: { email: string; _id: any } }>('user', 'email')
            .select('name user')
            .lean();

        return profiles.map((p) => ({
            userId: p.user?._id,
            email: (p.user as any)?.email ?? '',
            name: p.name ?? 'User',
        }));
    }

    if (targetAudience === 'specific_users') {
        const profiles = await UserProfile.find({ user: { $in: targetUserIds } })
            .populate<{ user: { email: string; _id: any } }>('user', 'email')
            .select('name user')
            .lean();
        return profiles.map((p) => ({
            userId: p.user?._id,
            email: (p.user as any)?.email ?? '',
            name: p.name ?? 'User',
        }));
    }

    let filter: Record<string, unknown> = {};

    if (targetAudience === 'all_lawyers') filter = { 'user.role': 'user' };  // lawyers stored as role='user'
    else if (targetAudience === 'all_clients') filter = {};
    else if (targetAudience === 'segment') filter = segmentFilter ?? {};

    // Use UserProfile + populate to get email from auth User
    const profiles = await UserProfile.find(filter)
        .populate<{ user: { email: string; role: string; _id: any } }>('user', 'email role')
        .select('name user credits isElitePro profileType')
        .lean();

    // Filter by audience type for all_lawyers / all_clients / all_users
    const filtered = profiles.filter((p) => {
        if (!p.user) return false;
        if (targetAudience === 'all_lawyers') return (p.user as any).role === 'user'; // lawyers
        if (targetAudience === 'all_clients') return (p.user as any).role === 'client';
        return true; // all_users or segment
    });

    return filtered.map((p) => ({
        userId: p.user?._id,
        email: (p.user as any)?.email ?? '',
        name: p.name ?? 'User',
    }));
};

/** Update daily sending stats for a campaign */
const updateDailyStats = async (campaignId: string, count: number) => {
    const today = new Date().toISOString().split('T')[0];
    const campaign = await EmailCampaign.findById(campaignId);
    if (!campaign) return;

    const existingStat = campaign.dailyStats.find((s) => s.date === today);
    if (existingStat) {
        existingStat.count += count;
    } else {
        campaign.dailyStats.push({ date: today, count });
    }
    await campaign.save();
};

/* ──────────────────────────────────────────────────────────────────
   DISPATCH — send emails in batches of 50
 ────────────────────────────────────────────────────────────────── */
export const dispatchCampaign = async (campaign: IEmailCampaign): Promise<void> => {
    const targets = await resolveTargetUsers(campaign);
    if (targets.length === 0 && (campaign as any).targetAudience !== 'individual_scheduled') {
        await EmailCampaign.findByIdAndUpdate((campaign as any)._id, { status: 'sent' });
        return;
    }

    await EmailCampaign.findByIdAndUpdate((campaign as any)._id, {
        status: 'sending',
        totalTargeted: (campaign as any).targetAudience === 'individual_scheduled' ? (campaign as any).userSchedules.length : targets.length,
    });

    let sentCount = 0;
    let failedCount = 0;
    const sentLog: IEmailCampaign['sentLog'] = [];

    const BATCH = 50;
    for (let i = 0; i < targets.length; i += BATCH) {
        const chunk = targets.slice(i, i + BATCH);

        await Promise.allSettled(
            chunk.map(async (target) => {
                try {
                    await sendEmail({
                        to: target.email,
                        subject: campaign.subject,
                        data: {
                            name: target.name,
                            ...campaign.customData,
                        },
                        emailTemplate: campaign.templateKey,
                    });
                    sentCount++;
                    sentLog.push({
                        userId: target.userId,
                        email: target.email,
                        sentAt: new Date(),
                        status: 'sent',
                    });

                    // Update individual schedule status if applicable
                    if ((campaign as any).targetAudience === 'individual_scheduled') {
                        await EmailCampaign.updateOne(
                            { _id: (campaign as any)._id, 'userSchedules.userId': target.userId },
                            {
                                $set: {
                                    'userSchedules.$.status': 'sent',
                                    'userSchedules.$.sentAt': new Date(),
                                },
                            },
                        );
                    }
                } catch (err: any) {
                    failedCount++;
                    sentLog.push({
                        userId: target.userId,
                        email: target.email,
                        sentAt: new Date(),
                        status: 'failed',
                        error: err?.message ?? 'Unknown error',
                    });

                    if ((campaign as any).targetAudience === 'individual_scheduled') {
                        await EmailCampaign.updateOne(
                            { _id: (campaign as any)._id, 'userSchedules.userId': target.userId },
                            {
                                $set: {
                                    'userSchedules.$.status': 'failed',
                                    'userSchedules.$.error': err?.message ?? 'Unknown error',
                                },
                            },
                        );
                    }
                }
            }),
        );

        // Small pause between batches to avoid SMTP rate limiting
        if (i + BATCH < targets.length) {
            await new Promise((r) => setTimeout(r, 200));
        }
    }

    // Determine final status
    let finalStatus: IEmailCampaign['status'] = 'sent';
    if ((campaign as any).targetAudience === 'individual_scheduled') {
        const fresh = await EmailCampaign.findById((campaign as any)._id);
        const hasPending = fresh?.userSchedules.some(s => s.status === 'pending');
        finalStatus = hasPending ? 'sending' : 'sent';
    }

    await EmailCampaign.findByIdAndUpdate((campaign as any)._id, {
        status: finalStatus,
        $inc: { sentCount, failedCount },
        sentAt: new Date(),
        lastRunAt: new Date(),
        $push: { sentLog: { $each: sentLog } },
    });

    // Update daily tracking stats
    if (sentCount > 0) {
        await updateDailyStats((campaign._id as any).toString(), sentCount);
    }
};

/** Get daily sending stats for a specific campaign */
const getCampaignDailyStats = async (id: string) => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new AppError(HTTP_STATUS.BAD_REQUEST, 'Invalid campaign ID');
    }
    const campaign = await EmailCampaign.findById(id).select('dailyStats').lean();
    if (!campaign) throw new AppError(HTTP_STATUS.NOT_FOUND, 'Campaign not found');
    return campaign.dailyStats || [];
};

/* ──────────────────────────────────────────────────────────────────
   CRUD SERVICE
────────────────────────────────────────────────────────────────── */

/** Create a new campaign (and optionally queue/dispatch it immediately) */
const createCampaign = async (
    adminUserId: string,
    payload: Partial<IEmailCampaign>,
) => {
    const campaign = await EmailCampaign.create({
        ...payload,
        createdBy: new mongoose.Types.ObjectId(adminUserId),
        status: payload.scheduleType === 'immediate' ? 'queued' : 'draft',
    });

    // Fire immediately in background — no await to avoid blocking response
    if (payload.scheduleType === 'immediate') {
        setImmediate(async () => {
            try {
                await dispatchCampaign(campaign);
            } catch (err) {
                // eslint-disable-next-line no-console
                console.error('[EmailCampaign] Immediate dispatch failed:', err);
                await EmailCampaign.findByIdAndUpdate(campaign._id, { status: 'failed' });
            }
        });
    } else if (payload.scheduleType === 'scheduled') {
        // Mark as queued so the 5-min cron picks it up
        await EmailCampaign.findByIdAndUpdate(campaign._id, { status: 'queued' });
    }

    return campaign;
};

/** List all campaigns with pagination + optional status filter */
const getAllCampaigns = async (query: Record<string, string>) => {
    const {
        page = '1',
        limit = '10',
        status,
        scheduleType,
        search,
        sortBy = 'createdAt',
        sortOrder = 'desc',
    } = query;

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const filter: Record<string, unknown> = {};
    if (status) filter.status = status;
    if (scheduleType) filter.scheduleType = scheduleType;
    if (search) filter.title = { $regex: search, $options: 'i' };

    const sort: Record<string, 1 | -1> = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

    const [data, total] = await Promise.all([
        EmailCampaign.find(filter)
            .sort(sort)
            .skip(skip)
            .limit(limitNum)
            .populate('createdBy', 'email')
            .select('-sentLog')  // exclude heavy log from list view
            .lean(),
        EmailCampaign.countDocuments(filter),
    ]);

    return {
        data,
        pagination: {
            page: pageNum,
            limit: limitNum,
            total,
            totalPage: Math.ceil(total / limitNum),
        },
    };
};

/** Get a single campaign with full delivery log */
const getCampaignById = async (id: string) => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new AppError(HTTP_STATUS.BAD_REQUEST, 'Invalid campaign ID');
    }

    const campaign = await EmailCampaign.findById(id)
        .populate('createdBy', 'email')
        .lean();

    if (!campaign) {
        throw new AppError(HTTP_STATUS.NOT_FOUND, 'Campaign not found');
    }

    // Compute delivery stats
    const deliveryRate = campaign.totalTargeted
        ? Math.round((campaign.sentCount / campaign.totalTargeted) * 100)
        : 0;

    return { ...campaign, deliveryRate };
};

/** Update a campaign (only drafts or queued can be fully edited) */
const updateCampaign = async (id: string, payload: Partial<IEmailCampaign>) => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new AppError(HTTP_STATUS.BAD_REQUEST, 'Invalid campaign ID');
    }

    const existing = await EmailCampaign.findById(id);
    if (!existing) throw new AppError(HTTP_STATUS.NOT_FOUND, 'Campaign not found');

    // Prevent editing campaigns that are already sending/sent
    if (['sending', 'sent'].includes(existing.status)) {
        throw new AppError(
            HTTP_STATUS.BAD_REQUEST,
            'Cannot edit a campaign that is already sending or has been sent',
        );
    }

    // Disallow changing delivery status manually via update
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { status: _status, sentLog: _log, sentCount: _sc, failedCount: _fc, ...safePayload } = payload as any;

    const updated = await EmailCampaign.findByIdAndUpdate(id, safePayload, {
        new: true,
        runValidators: true,
    });

    return updated;
};

/** Cancel / delete a campaign */
const deleteCampaign = async (id: string) => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new AppError(HTTP_STATUS.BAD_REQUEST, 'Invalid campaign ID');
    }

    const existing = await EmailCampaign.findById(id);
    if (!existing) throw new AppError(HTTP_STATUS.NOT_FOUND, 'Campaign not found');

    if (existing.status === 'sending') {
        throw new AppError(HTTP_STATUS.BAD_REQUEST, 'Cannot delete a campaign that is currently sending');
    }

    // Soft-cancel or hard delete depending on whether it was ever sent
    if (existing.status === 'sent') {
        await EmailCampaign.findByIdAndUpdate(id, { status: 'canceled' });
        return { deleted: false, canceled: true };
    }

    await EmailCampaign.findByIdAndDelete(id);
    return { deleted: true, canceled: false };
};

/** Force-send an existing campaign immediately */
const sendCampaignNow = async (id: string) => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new AppError(HTTP_STATUS.BAD_REQUEST, 'Invalid campaign ID');
    }

    const campaign = await EmailCampaign.findById(id);
    if (!campaign) throw new AppError(HTTP_STATUS.NOT_FOUND, 'Campaign not found');

    if (campaign.status === 'sending') {
        throw new AppError(HTTP_STATUS.BAD_REQUEST, 'Campaign is already sending');
    }
    if (campaign.status === 'sent') {
        throw new AppError(HTTP_STATUS.BAD_REQUEST, 'Campaign has already been sent. Duplicate it if you want to resend.');
    }

    await EmailCampaign.findByIdAndUpdate(id, { status: 'queued' });

    // Dispatch in background
    setImmediate(async () => {
        try {
            const fresh = await EmailCampaign.findById(id);
            if (fresh) await dispatchCampaign(fresh);
        } catch (err) {
            // eslint-disable-next-line no-console
            console.error('[EmailCampaign] Manual send failed:', err);
            await EmailCampaign.findByIdAndUpdate(id, { status: 'failed' });
        }
    });

    return { message: 'Campaign dispatch started', campaignId: id };
};

/** Send a preview email to admin's own email */
const sendPreview = async (
    adminEmail: string,
    adminName: string,
    payload: { templateKey: string; subject: string; customData?: Record<string, unknown> },
) => {
    await sendEmail({
        to: adminEmail,
        subject: `[PREVIEW] ${payload.subject}`,
        data: {
            name: adminName,
            ...payload.customData,
        },
        emailTemplate: payload.templateKey,
    });
    return { message: `Preview email sent to ${adminEmail}` };
};

/** Get the list of available template keys (for UI dropdown) */
const getTemplateKeys = () => AVAILABLE_TEMPLATE_KEYS;

/** Get built-in segment presets */
const getSegmentPresets = () => SEGMENT_PRESETS;

/* ──────────────────────────────────────────────────────────────────
   EXPORT
────────────────────────────────────────────────────────────────── */
export const emailCampaignService = {
    createCampaign,
    getAllCampaigns,
    getCampaignById,
    updateCampaign,
    deleteCampaign,
    sendCampaignNow,
    sendPreview,
    getTemplateKeys,
    getSegmentPresets,
    getCampaignDailyStats,
    dispatchCampaign,
    resolveTargetUsers,
};
