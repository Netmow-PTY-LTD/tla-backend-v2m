import { IUser } from '../Auth/auth.interface';
import { User } from '../Auth/auth.model';
import { EmailTemplate } from '../emailSystem/emailTemplate.model';
import { IUserProfile } from '../User/user.interface';
import { EmailQueue } from './emailQueue.model';

// Lawer flow configuration
const lawyerFlow = [
    { step: 1, templateKey: 'complete_profile', delayMs: 6 * 60 * 60 * 1000 }, // 6 hours
    { step: 2, templateKey: 'how_to_bid', delayMs: 12 * 60 * 60 * 1000 }, // 12 hours
    { step: 3, templateKey: 'buy_credit', delayMs: 24 * 60 * 60 * 1000 }, // 1 day
    { step: 4, templateKey: 'win_job', delayMs: 2 * 24 * 60 * 60 * 1000 }, // 2 days
    { step: 5, templateKey: 'subscription_benefits', delayMs: 3 * 24 * 60 * 60 * 1000 }, // 3 days
    { step: 6, templateKey: 'elite_pro', delayMs: 5 * 24 * 60 * 60 * 1000 }, // 5 days
];

// Client flow configuration
const clientFlow = [
    { step: 1, templateKey: 'how_to_post_case', delayMs: 24 * 60 * 60 * 1000 }, // 1 day
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
            case 'complete_profile':
                return !!(profile.bio || profile.profilePicture || (profile.serviceIds && profile.serviceIds.length > 0));
            case 'how_to_bid':
                return (profile.responseCases || 0) > 0;
            case 'buy_credit':
                return (profile.credits || 0) > 0;
            case 'win_job':
                return (profile.hiredCases || 0) > 0;
            case 'subscription_benefits':
                return !!profile.subscriptionId;
            case 'elite_pro':
                return !!profile.isElitePro;
            case 'how_to_post_case':
                return (profile.totalCases || 0) > 0;
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

    processScheduledEmails: async () => {
        const now = new Date();
        // find users where next_email_at <= now AND email_paused = false
        const usersToEmail = await User.find({
            next_email_at: { $lte: now, $ne: null },
            email_paused: false,
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
                    await EmailQueue.create({
                        userId: user._id,
                        email: user.email,
                        templateKey: template.templateKey,
                        scheduledAt: now,
                        status: 'pending',
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
