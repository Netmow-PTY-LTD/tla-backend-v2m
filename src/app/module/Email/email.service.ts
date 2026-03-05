import { User } from '../Auth/auth.model';
import { EmailTemplate } from '../emailSystem/emailTemplate.model';
import { EmailQueue } from './emailQueue.model';

// Lawer flow configuration
const lawyerFlow = [
    { step: 1, templateKey: 'welcome', delayMs: 0 },
    { step: 2, templateKey: 'complete_profile', delayMs: 6 * 60 * 60 * 1000 }, // 6 hours // if users activated account but did not yet complete profile.
    { step: 3, templateKey: 'how_to_bid', delayMs: 12 * 60 * 60 * 1000 }, // 12 hours // if users completed profile but did not yet bid.
    { step: 4, templateKey: 'buy_credit', delayMs: 24 * 60 * 60 * 1000 }, // 1 day  // if users completed profile but did not yet buy credit.
    { step: 5, templateKey: 'win_job', delayMs: 2 * 24 * 60 * 60 * 1000 }, // 2 days   // if users completed profile but did not yet win job.
    { step: 6, templateKey: 'subscription_benefits', delayMs: 3 * 24 * 60 * 1000 }, // 3 days // if users completed profile but did not yet subscribe.
    { step: 7, templateKey: 'elite_pro', delayMs: 5 * 24 * 60 * 1000 }, // 5 days // if users completed profile but did not yet subscribe to Elite Pro.
];

// Client flow configuration (generic placeholder if not specified)
const clientFlow = [
    { step: 1, templateKey: 'welcome_client', delayMs: 0 },
    { step: 2, templateKey: 'how_to_post_case', delayMs: 24 * 60 * 60 * 1000 },
];

export const emailFlowService = {
    getFlowByRole: (role: string) => {
        if (role === 'lawyer') return lawyerFlow;
        if (role === 'client') return clientFlow;
        return [];
    },

    processScheduledEmails: async () => {
        const now = new Date();
        // 1. find users where next_email_at <= now AND email_paused = false
        const usersToEmail = await User.find({
            next_email_at: { $lte: now, $ne: null },
            email_paused: false,
        });

        for (const user of usersToEmail) {
            const flow = emailFlowService.getFlowByRole(user.regUserType);

            // email_step might start at 1 or 0. Let's say it tracks the *current* or *upcoming* step.
            // If it started at 0 and we are about to send Step 1.
            const currentStepIndex = user.email_step; // If we use 0-indexed internally but 1-indexed in labels
            const currentFlowStep = flow[currentStepIndex];

            if (currentFlowStep) {
                // 2. determine template using email_step (index based)
                const template = await EmailTemplate.findOne({ templateKey: currentFlowStep.templateKey, isActive: true });

                if (template) {
                    // 3. insert job into email_queue
                    await EmailQueue.create({
                        userId: user._id,
                        email: user.email,
                        templateKey: template.templateKey,
                        scheduledAt: now,
                        status: 'pending',
                    });
                }

                // 4. update user: email_step += 1, next_email_at = next scheduled delay
                const nextStepIndex = currentStepIndex + 1;
                const nextFlowStep = flow[nextStepIndex];

                const updateData: any = {
                    email_step: nextStepIndex,
                };

                if (nextFlowStep) {
                    updateData.next_email_at = new Date(now.getTime() + nextFlowStep.delayMs);
                } else {
                    updateData.next_email_at = null; // flow finished
                }

                await User.findByIdAndUpdate(user._id, updateData);
            } else {
                // Reached end of flow or invalid step
                await User.findByIdAndUpdate(user._id, { next_email_at: null });
            }
        }
    },
};
