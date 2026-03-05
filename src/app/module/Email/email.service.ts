import { IUser } from '../Auth/auth.interface';
import { User } from '../Auth/auth.model';
import { EmailTemplate } from '../emailSystem/emailTemplate.model';
import { IUserProfile } from '../User/user.interface';
import { EmailQueue } from './emailQueue.model';
import { EMAIL_TEMPLATE_KEYS } from '../emailSystem/emailTemplate.constant';
import { USER_STATUS } from '../Auth/auth.constant';
import { addEmailToQueue } from './email.queue';

// Lawer flow configuration
const lawyerFlow = [
    { step: 1, templateKey: EMAIL_TEMPLATE_KEYS.TUTORIAL_SYSTEM, delayMs: 1 * 60 * 60 * 1000 }, // 1 hour after registration
    { step: 2, templateKey: EMAIL_TEMPLATE_KEYS.COMPLETE_PROFILE, delayMs: 5 * 60 * 60 * 1000 }, // 6 hours total
    { step: 3, templateKey: EMAIL_TEMPLATE_KEYS.COMPLETE_PROFILE_REMINDER, delayMs: 18 * 60 * 60 * 1000 }, // 24 hours total
    { step: 4, templateKey: EMAIL_TEMPLATE_KEYS.HOW_TO_BID, delayMs: 24 * 60 * 60 * 1000 },
    { step: 5, templateKey: EMAIL_TEMPLATE_KEYS.BUY_CREDIT, delayMs: 24 * 60 * 60 * 1000 },
    { step: 6, templateKey: EMAIL_TEMPLATE_KEYS.WIN_JOB, delayMs: 24 * 60 * 60 * 1000 },
    { step: 7, templateKey: EMAIL_TEMPLATE_KEYS.SUBSCRIPTION_BENEFITS, delayMs: 2 * 24 * 60 * 60 * 1000 },
    { step: 8, templateKey: EMAIL_TEMPLATE_KEYS.ELITE_PRO, delayMs: 3 * 24 * 60 * 60 * 1000 },
    { step: 9, templateKey: EMAIL_TEMPLATE_KEYS.INVOICE_DUE_21, delayMs: 11 * 24 * 60 * 60 * 1000 }, // ~21 days after reg
    { step: 10, templateKey: EMAIL_TEMPLATE_KEYS.INVOICE_DUE_30, delayMs: 9 * 24 * 60 * 60 * 1000 }, // ~30 days after reg
];

// Client flow configuration
const clientFlow = [
    { step: 1, templateKey: EMAIL_TEMPLATE_KEYS.HOW_TO_POST_CASE, delayMs: 24 * 60 * 60 * 1000 }, // 1 day
];

export const emailFlowService = {
    getFlowByRole: (role: string) => {
        if (role === 'lawyer') return lawyerFlow;
        if (role === 'client') return clientFlow;
        return [];
    },

    /**
     * Helper to check if a user has already satisfied the goal of a specific email step.
     */
    isConditionMet: (user: IUser, templateKey: string): boolean => {


        const profile = user.profile as IUserProfile;
        if (!profile) return false;

        switch (templateKey) {
            case EMAIL_TEMPLATE_KEYS.TUTORIAL_SYSTEM:
                return false; // Always send
            case EMAIL_TEMPLATE_KEYS.COMPLETE_PROFILE:
            case EMAIL_TEMPLATE_KEYS.COMPLETE_PROFILE_REMINDER:
                return !!(profile.bio || profile.profilePicture || (profile.serviceIds && profile.serviceIds.length > 0));
            case EMAIL_TEMPLATE_KEYS.HOW_TO_BID:
                return (profile.responseCases || 0) > 0;
            case EMAIL_TEMPLATE_KEYS.BUY_CREDIT:
                return (profile.credits || 0) > 0;
            case EMAIL_TEMPLATE_KEYS.WIN_JOB:
                return (profile.hiredCases || 0) > 0;
            case EMAIL_TEMPLATE_KEYS.SUBSCRIPTION_BENEFITS:
                return !!profile.subscriptionId;
            case EMAIL_TEMPLATE_KEYS.ELITE_PRO:
                return !!profile.isElitePro;
            case EMAIL_TEMPLATE_KEYS.HOW_TO_POST_CASE:
                return (profile.totalCases || 0) > 0;
            case EMAIL_TEMPLATE_KEYS.INVOICE_DUE_21:
            case EMAIL_TEMPLATE_KEYS.INVOICE_DUE_30:
                return false; // Always send based on time
            default:
                return false;
        }
    },

    /**
     * Initial data for a new user to start the automation flow.
     */
    getInitialFlowData: (role: string) => {
        const flow = emailFlowService.getFlowByRole(role);
        if (flow.length > 0) {
            return {
                email_step: 0,
                next_email_at: new Date(Date.now() + flow[0].delayMs),
            };
        }
        return {
            email_step: 0,
            next_email_at: null,
        };
    },

    /**
     * Transactional Email: Subscription Confirmed
     * Trigger this manually from the payment/subscription service.
     */
    sendSubscriptionConfirmation: async (userId: string, planName: string) => {
        const user = await User.findById(userId);
        if (!user) return;

        console.log(`Scheduling confirmation for plan: ${planName}`);

        const jobRecord = await EmailQueue.create({
            userId: user._id,
            email: user.email,
            templateKey: EMAIL_TEMPLATE_KEYS.SUBSCRIPTION_CONFIRMED,
            scheduledAt: new Date(),
            status: 'pending',
            person_type: user.regUserType as 'client' | 'lawyer' | 'admin',
            email_type: 'transactional',
        });

        // Add to BullMQ
        await addEmailToQueue({
            mongoJobId: jobRecord._id,
            userId: user._id,
            email: user.email,
            templateKey: EMAIL_TEMPLATE_KEYS.SUBSCRIPTION_CONFIRMED,
            data: { planName }
        });
    },



    processScheduledEmails: async () => {
        const now = new Date();
        // find users where next_email_at <= now AND email_paused = false
        const usersToEmail = await User.find({
            next_email_at: { $lte: now, $ne: null },
            email_paused: false,
            accountStatus: USER_STATUS.APPROVED,
        }).populate('profile');

        for (const user of usersToEmail) {
            const flow = emailFlowService.getFlowByRole(user.regUserType);
            let stepIndex = user.email_step;
            let currentFlowStep = flow[stepIndex];

            // Logic improvement: Skip steps if condition already met
            while (currentFlowStep && emailFlowService.isConditionMet(user, currentFlowStep.templateKey)) {
                stepIndex++;
                currentFlowStep = flow[stepIndex];
            }

            if (currentFlowStep) {
                // Determine template
                const template = await EmailTemplate.findOne({ templateKey: currentFlowStep.templateKey, isActive: true });

                if (template) {
                    const jobRecord = await EmailQueue.create({
                        userId: user._id,
                        email: user.email,
                        templateKey: template.templateKey,
                        scheduledAt: now,
                        status: 'pending',
                        person_type: user.regUserType as 'client' | 'lawyer' | 'admin',
                        email_type: 'automation',
                    });

                    // Add to BullMQ
                    await addEmailToQueue({
                        mongoJobId: jobRecord._id,
                        userId: user._id,
                        email: user.email,
                        templateKey: template.templateKey,
                    });
                }

                // Move to NEXT step and schedule it
                const nextStepIndex = stepIndex + 1;
                const nextFlowStep = flow[nextStepIndex];

                const updateData: { email_step: number, next_email_at: Date | null } = {
                    email_step: nextStepIndex,
                    next_email_at: nextFlowStep ? new Date(now.getTime() + nextFlowStep.delayMs) : null,
                };

                await User.findByIdAndUpdate(user._id, updateData);
            } else {
                // Reached end of flow or all remaining conditions met
                await User.findByIdAndUpdate(user._id, { next_email_at: null, email_step: stepIndex });
            }
        }
    },
};
