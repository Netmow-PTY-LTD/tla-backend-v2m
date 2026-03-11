/* eslint-disable @typescript-eslint/no-explicit-any */
import { IUser } from '../module/Auth/auth.interface';
import { User } from '../module/Auth/auth.model';
import { EmailTemplate, EmailTemplateCategory } from '../module/emailTemplateSystem/emailTemplate.model';
import { IUserProfile } from '../module/User/user.interface';
import { EmailQueue } from '../queues/emailQueue.model';
import { EMAIL_TEMPLATE_KEYS } from '../module/emailTemplateSystem/emailTemplate.constant';
import { USER_STATUS } from '../module/Auth/auth.constant';
import { addEmailToQueue } from '../queues/email.queue';
import { ClientRegistrationDraft } from '../module/Auth/clientRegistrationDraft.model';
import { LawyerRegistrationDraft } from '../module/Auth/LawyerRegistrationDraft.model';

export const emailFlowService = {
    /**
     * Helper to check if a user has already satisfied the goal of a specific email step.
     */
    isConditionMet: (user: IUser, templateKey: string): boolean => {
        const profile = user.profile as IUserProfile;
        if (!profile) return false;

        switch (templateKey) {
            case EMAIL_TEMPLATE_KEYS.TUTORIAL_SYSTEM:
                return false; // Always send
            case EMAIL_TEMPLATE_KEYS.COMPLETE_PROFILE_REMINDER:
                return !!(profile.bio || profile.profilePicture || (profile.serviceIds && profile.serviceIds.length > 0));
            case EMAIL_TEMPLATE_KEYS.HOW_TO_BID:
            case EMAIL_TEMPLATE_KEYS.THOUSAND_CASES_WAITING:
                return (profile.responseCases || 0) > 0;
            case EMAIL_TEMPLATE_KEYS.BUY_CREDIT:
                return (profile.credits || 0) > 0;
            case EMAIL_TEMPLATE_KEYS.WIN_JOB:
                return (profile.hiredCases || 0) > 0;
            case EMAIL_TEMPLATE_KEYS.HOW_TO_BE_SUBSCRIBED_USER:
            case EMAIL_TEMPLATE_KEYS.SUBSCRIPTION_BENEFITS:
                return !!profile.subscriptionId;
            case EMAIL_TEMPLATE_KEYS.ELITE_PRO:
            case EMAIL_TEMPLATE_KEYS.BENEFIT_OF_ELITE_PRO_MEMBER:
                return !!profile.isElitePro;
            case EMAIL_TEMPLATE_KEYS.HOW_TO_POST_CASE:
            case EMAIL_TEMPLATE_KEYS.HOW_TO_FIND_RIGHT_LAWYER:
                return (profile.totalCases || 0) > 0;
            case EMAIL_TEMPLATE_KEYS.INVOICE_DUE_21:
            case EMAIL_TEMPLATE_KEYS.INVOICE_DUE_30:
            case EMAIL_TEMPLATE_KEYS.SPECIAL_EVENTS_EMAIL:
                return false; // Always send based on time
            default:
                return false;
        }
    },

    /**
     * Initial data for a new user to start the automation flow.
     */
    getInitialFlowData: async (role: string) => {
        // Find the "promotional" category ID to filter by
        const categoryName = role === 'lawyer' ? 'Promotional Email for Lawyer' : role === 'client' ? 'Promotional Email for Client' : 'promotional';
        let promoCategory = await EmailTemplateCategory.findOne({ name: categoryName });
        
        // Fallback to general 'promotional' category if specific one is not found
        if (!promoCategory && categoryName !== 'promotional') {
            promoCategory = await EmailTemplateCategory.findOne({ name: 'promotional' });
        }

        const query: Record<string, any> = {
            target: role,
            isActive: true,
            step: { $gt: 0 }
        };

        if (promoCategory) {
            query.categoryId = promoCategory._id;
        }

        // Find the first active promotional template for the role based on the step order
        const firstTemplate = await EmailTemplate.findOne(query).sort({ step: 1 });

        if (firstTemplate) {
            return {
                email_step: firstTemplate.step,
                next_email_at: new Date(Date.now() + (firstTemplate.delayTime || 0)),
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
            // Allow BOTH Pending and Approved users to progress so they get delayed-activation emails
            accountStatus: { $in: [USER_STATUS.APPROVED, USER_STATUS.PENDING] },
        }).populate('profile');

        // Find the promotional categories
        const lawyerPromoCategory = await EmailTemplateCategory.findOne({ name: 'Promotional Email for Lawyer' });
        const clientPromoCategory = await EmailTemplateCategory.findOne({ name: 'Promotional Email for Client' });
        const generalPromoCategory = await EmailTemplateCategory.findOne({ name: 'promotional' });

        for (const user of usersToEmail) {
            const currentStep = user.email_step || 1;

            // Get all remaining active promotional templates for this user's role starting from their current step
            const query: Record<string, any> = {
                target: user.regUserType,
                step: { $gte: currentStep },
                isActive: true
            };

            let promoCategory = generalPromoCategory;
            if (user.regUserType === 'lawyer') {
                promoCategory = lawyerPromoCategory || generalPromoCategory;
            } else if (user.regUserType === 'client') {
                promoCategory = clientPromoCategory || generalPromoCategory;
            }

            if (promoCategory) {
                query.categoryId = promoCategory._id;
            }

            const templates = await EmailTemplate.find(query).sort({ step: 1 });

            let selectedTemplate = null;
            let finalStepIndex = 0;

            // Logic improvement: Skip templates if condition already met
            for (let i = 0; i < templates.length; i++) {
                const tmpl = templates[i];
                if (!emailFlowService.isConditionMet(user, tmpl.templateKey)) {
                    selectedTemplate = tmpl;
                    finalStepIndex = i;
                    break;
                }
            }

            if (selectedTemplate) {
                const jobRecord = await EmailQueue.create({
                    userId: user._id,
                    email: user.email,
                    templateKey: selectedTemplate.templateKey,
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
                    templateKey: selectedTemplate.templateKey,
                });

                // Move to NEXT step and schedule it
                const nextTemplate = templates[finalStepIndex + 1];

                const updateData: { email_step: number, next_email_at: Date | null } = {
                    email_step: nextTemplate ? nextTemplate.step : selectedTemplate.step + 1,
                    next_email_at: nextTemplate ? new Date(now.getTime() + (nextTemplate.delayTime || 0)) : null,
                };

                await User.findByIdAndUpdate(user._id, updateData);
            } else {
                // Reached end of flow or all remaining conditions met
                // Update email_step to beyond the highest available step
                const maxCheckedStep = templates.length > 0 ? templates[templates.length - 1].step : currentStep;
                await User.findByIdAndUpdate(user._id, { next_email_at: null, email_step: maxCheckedStep + 1 });
            }
        }

        // Process Client Registration Drafts
        try {
            const clientDrafts = await ClientRegistrationDraft.find({
                next_email_at: { $lte: now, $ne: null },
            });

            for (const draft of clientDrafts) {
                const template = await EmailTemplate.findOne({ templateKey: EMAIL_TEMPLATE_KEYS.CLIENT_DELAYED_ACTIVATION, isActive: true });
                if (template) {
                    const jobRecord = await EmailQueue.create({
                        userId: draft._id,
                        email: draft.leadDetails.email,
                        templateKey: template.templateKey,
                        scheduledAt: now,
                        status: 'pending',
                        person_type: 'client',
                        email_type: 'automation',
                    });

                    await addEmailToQueue({
                        mongoJobId: jobRecord._id,
                        userId: draft._id,
                        email: draft.leadDetails.email,
                        templateKey: template.templateKey,
                    });
                }
                await ClientRegistrationDraft.findByIdAndUpdate(draft._id, { next_email_at: null, email_step: 1 });
            }
        } catch (error) {
            console.error('Error processing client registration drafts emails:', error);
        }

        // Process Lawyer Registration Drafts
        try {
            const lawyerDrafts = await LawyerRegistrationDraft.find({
                next_email_at: { $lte: now, $ne: null },
            });

            for (const draft of lawyerDrafts) {
                const template = await EmailTemplate.findOne({ templateKey: EMAIL_TEMPLATE_KEYS.LAWYER_DELAYED_ACTIVATION, isActive: true });
                if (template) {
                    const jobRecord = await EmailQueue.create({
                        userId: draft._id,
                        email: draft.email,
                        templateKey: template.templateKey,
                        scheduledAt: now,
                        status: 'pending',
                        person_type: 'lawyer',
                        email_type: 'automation',
                    });

                    await addEmailToQueue({
                        mongoJobId: jobRecord._id,
                        userId: draft._id,
                        email: draft.email,
                        templateKey: template.templateKey,
                    });
                }
                await LawyerRegistrationDraft.findByIdAndUpdate(draft._id, { next_email_at: null, email_step: 1 });
            }
        } catch (error) {
            console.error('Error processing lawyer registration drafts emails:', error);
        }
    },
};








// ------------------------------------ previous email flow hardcoded logic atomotion ------------------------------------ 



/* 

import { IUser } from '../module/Auth/auth.interface';
import { User } from '../module/Auth/auth.model';
import { EmailTemplate } from '../module/emailTemplateSystem/emailTemplate.model';
import { IUserProfile } from '../module/User/user.interface';
import { EmailQueue } from '../queues/emailQueue.model';
import { EMAIL_TEMPLATE_KEYS } from '../module/emailTemplateSystem/emailTemplate.constant';
import { USER_STATUS } from '../module/Auth/auth.constant';
import { addEmailToQueue } from '../queues/email.queue';
import { ClientRegistrationDraft } from '../module/Auth/clientRegistrationDraft.model';
import { LawyerRegistrationDraft } from '../module/Auth/LawyerRegistrationDraft.model';

// Lawyer flow configuration
const lawyerFlow = [
    { step: 1, templateKey: EMAIL_TEMPLATE_KEYS.COMPLETE_PROFILE_REMINDER, delayMs: 2 * 24 * 60 * 60 * 1000 }, // 2-3 days after activation
    { step: 2, templateKey: EMAIL_TEMPLATE_KEYS.HOW_TO_BID, delayMs: 2 * 24 * 60 * 60 * 1000 }, // ~4-5 days after registration
    { step: 3, templateKey: EMAIL_TEMPLATE_KEYS.BUY_CREDIT, delayMs: 3 * 24 * 60 * 60 * 1000 }, // ~1 week after reg
    { step: 4, templateKey: EMAIL_TEMPLATE_KEYS.WIN_JOB, delayMs: 4 * 24 * 60 * 60 * 1000 }, // 1-2 weeks after reg
    { step: 5, templateKey: EMAIL_TEMPLATE_KEYS.HOW_TO_BE_SUBSCRIBED_USER, delayMs: 4 * 24 * 60 * 60 * 1000 }, // ~2 weeks after reg
    { step: 6, templateKey: EMAIL_TEMPLATE_KEYS.SUBSCRIPTION_BENEFITS, delayMs: 7 * 24 * 60 * 60 * 1000 }, // 3-4 weeks after reg
    { step: 7, templateKey: EMAIL_TEMPLATE_KEYS.THOUSAND_CASES_WAITING, delayMs: 3 * 24 * 60 * 60 * 1000 }, // 3-4 weeks after reg
    { step: 8, templateKey: EMAIL_TEMPLATE_KEYS.ELITE_PRO, delayMs: 6 * 24 * 60 * 60 * 1000 }, // After 1 month
    { step: 9, templateKey: EMAIL_TEMPLATE_KEYS.BENEFIT_OF_ELITE_PRO_MEMBER, delayMs: 10 * 24 * 60 * 60 * 1000 }, // 1-2 weeks after previous
    { step: 10, templateKey: EMAIL_TEMPLATE_KEYS.SPECIAL_EVENTS_EMAIL, delayMs: 30 * 24 * 60 * 60 * 1000 }, // Periodically
];

// Client flow configuration
const clientFlow = [
    { step: 1, templateKey: EMAIL_TEMPLATE_KEYS.HOW_TO_FIND_RIGHT_LAWYER, delayMs: 2 * 24 * 60 * 60 * 1000 }, // 2 days after reg
];

export const emailFlowService = {
    getFlowByRole: (role: string) => {
        if (role === 'lawyer') return lawyerFlow;
        if (role === 'client') return clientFlow;
        return [];
    },

    
     // Helper to check if a user has already satisfied the goal of a specific email step.
    
    isConditionMet: (user: IUser, templateKey: string): boolean => {


        const profile = user.profile as IUserProfile;
        if (!profile) return false;

        switch (templateKey) {
            case EMAIL_TEMPLATE_KEYS.TUTORIAL_SYSTEM:
                return false; // Always send
            case EMAIL_TEMPLATE_KEYS.COMPLETE_PROFILE_REMINDER:
                return !!(profile.bio || profile.profilePicture || (profile.serviceIds && profile.serviceIds.length > 0));
            case EMAIL_TEMPLATE_KEYS.HOW_TO_BID:
            case EMAIL_TEMPLATE_KEYS.THOUSAND_CASES_WAITING:
                return (profile.responseCases || 0) > 0;
            case EMAIL_TEMPLATE_KEYS.BUY_CREDIT:
                return (profile.credits || 0) > 0;
            case EMAIL_TEMPLATE_KEYS.WIN_JOB:
                return (profile.hiredCases || 0) > 0;
            case EMAIL_TEMPLATE_KEYS.HOW_TO_BE_SUBSCRIBED_USER:
            case EMAIL_TEMPLATE_KEYS.SUBSCRIPTION_BENEFITS:
                return !!profile.subscriptionId;
            case EMAIL_TEMPLATE_KEYS.ELITE_PRO:
            case EMAIL_TEMPLATE_KEYS.BENEFIT_OF_ELITE_PRO_MEMBER:
                return !!profile.isElitePro;
            case EMAIL_TEMPLATE_KEYS.HOW_TO_POST_CASE:
            case EMAIL_TEMPLATE_KEYS.HOW_TO_FIND_RIGHT_LAWYER:
                return (profile.totalCases || 0) > 0;
            case EMAIL_TEMPLATE_KEYS.INVOICE_DUE_21:
            case EMAIL_TEMPLATE_KEYS.INVOICE_DUE_30:
            case EMAIL_TEMPLATE_KEYS.SPECIAL_EVENTS_EMAIL:
                return false; // Always send based on time
            default:
                return false;
        }
    },

   
    // Initial data for a new user to start the automation flow.
     
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

    
      // Transactional Email: Subscription Confirmed
      // Trigger this manually from the payment/subscription service.
     
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
            // Allow BOTH Pending and Approved users to progress so they get delayed-activation emails
            accountStatus: { $in: [USER_STATUS.APPROVED, USER_STATUS.PENDING] },
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

        // Process Client Registration Drafts
        try {
            const clientDrafts = await ClientRegistrationDraft.find({
                next_email_at: { $lte: now, $ne: null },
            });

            for (const draft of clientDrafts) {
                const template = await EmailTemplate.findOne({ templateKey: EMAIL_TEMPLATE_KEYS.CLIENT_DELAYED_ACTIVATION, isActive: true });
                if (template) {
                    const jobRecord = await EmailQueue.create({
                        userId: draft._id,
                        email: draft.leadDetails.email,
                        templateKey: template.templateKey,
                        scheduledAt: now,
                        status: 'pending',
                        person_type: 'client',
                        email_type: 'automation',
                    });

                    await addEmailToQueue({
                        mongoJobId: jobRecord._id,
                        userId: draft._id,
                        email: draft.leadDetails.email,
                        templateKey: template.templateKey,
                    });
                }
                await ClientRegistrationDraft.findByIdAndUpdate(draft._id, { next_email_at: null, email_step: 1 });
            }
        } catch (error) {
            console.error('Error processing client registration drafts emails:', error);
        }

        // Process Lawyer Registration Drafts
        try {
            const lawyerDrafts = await LawyerRegistrationDraft.find({
                next_email_at: { $lte: now, $ne: null },
            });

            for (const draft of lawyerDrafts) {
                const template = await EmailTemplate.findOne({ templateKey: EMAIL_TEMPLATE_KEYS.LAWYER_DELAYED_ACTIVATION, isActive: true });
                if (template) {
                    const jobRecord = await EmailQueue.create({
                        userId: draft._id,
                        email: draft.email,
                        templateKey: template.templateKey,
                        scheduledAt: now,
                        status: 'pending',
                        person_type: 'lawyer',
                        email_type: 'automation',
                    });

                    await addEmailToQueue({
                        mongoJobId: jobRecord._id,
                        userId: draft._id,
                        email: draft.email,
                        templateKey: template.templateKey,
                    });
                }
                await LawyerRegistrationDraft.findByIdAndUpdate(draft._id, { next_email_at: null, email_step: 1 });
            }
        } catch (error) {
            console.error('Error processing lawyer registration drafts emails:', error);
        }
    },
};










*/