export const EMAIL_TEMPLATE_KEYS = {
    WELCOME_LEAD_SUBMISSION: 'welcome_Lead_submission',
    WELCOME_TO_CLIENT: 'welcome_to_client',
    WELCOME_TO_LAWYER: 'welcome_to_lawyer',
    WELCOME_TO_LAWYER_BY_MARKETER: 'welcome_to_lawyer_by_marketer',
    CONTACT: 'contact',
    PUBLIC_CONTACT: 'public-contact',
    VERIFY_EMAIL: 'verify_email',
    NEW_LEAD_ALERT: 'new_lead_alert',
    PASSWORD_RESET: 'password_reset',
    OTP_EMAIL: 'otp_email',
    LAWYER_PROMOTION: 'lawyerPromotion',
    LAWYER_APPROVED: 'lawyer_approved',
    FIRM_PASSWORD_RESET: 'firm_password_reset',
    REQUEST_LAWYER_AS_FIRM_MEMBER: 'request_lawyer_as_firm_member',
    FIRM_REGISTRATION: 'firm_registration',
    NEW_CLAIM_NOTIFICATION: 'new_claim_notification',
    TUTORIAL_SYSTEM: 'tutorial_system',
    COMPLETE_PROFILE: 'complete_profile',
    COMPLETE_PROFILE_REMINDER: 'complete_profile_reminder',
    HOW_TO_BID: 'how_to_bid',
    BUY_CREDIT: 'buy_credit',
    WIN_JOB: 'win_job',
    SUBSCRIPTION_BENEFITS: 'subscription_benefits',
    ELITE_PRO: 'elite_pro',
    INVOICE_DUE_21: 'invoice_due_21',
    INVOICE_DUE_30: 'invoice_due_30',
    HOW_TO_POST_CASE: 'how_to_post_case',
    SUBSCRIPTION_CONFIRMED: 'subscription_confirmed',
} as const;

export const EMAIL_TEMPLATES = [
    {
        key: EMAIL_TEMPLATE_KEYS.WELCOME_LEAD_SUBMISSION,
        label: 'Welcome Lead Submission',
        variables: ['name', 'caseType', 'leadAnswer', 'preferredContactTime', 'additionalDetails', 'dashboardUrl', 'appName'],
    },
    {
        key: EMAIL_TEMPLATE_KEYS.WELCOME_TO_CLIENT,
        label: 'Welcome to Client',
        variables: ['name', 'email', 'defaultPassword', 'dashboardUrl'],
    },
    {
        key: EMAIL_TEMPLATE_KEYS.WELCOME_TO_LAWYER,
        label: 'Welcome to Lawyer',
        variables: ['name', 'paracticeArea', 'dashboardUrl'],
    },
    {
        key: EMAIL_TEMPLATE_KEYS.WELCOME_TO_LAWYER_BY_MARKETER,
        label: 'Welcome Lawyer (By Marketer)',
        variables: ['name', 'email', 'defaultPassword', 'paracticeArea', 'dashboardUrl'],
    },
    {
        key: EMAIL_TEMPLATE_KEYS.CONTACT,
        label: 'Lawyer Interaction',
        variables: ['name', 'userRole', 'dashboardUrl', 'senderName', 'timestamp', 'message'],
    },
    {
        key: EMAIL_TEMPLATE_KEYS.PUBLIC_CONTACT,
        label: 'Public Contact Form',
        variables: ['name', 'email', 'phone', 'message'],
    },
    {
        key: EMAIL_TEMPLATE_KEYS.VERIFY_EMAIL,
        label: 'Email Verification',
        variables: ['name', 'verifyUrl', 'role'],
    },
    {
        key: EMAIL_TEMPLATE_KEYS.NEW_LEAD_ALERT,
        label: 'New Lead Alert',
        variables: ['clientName', 'lawyerType', 'location', 'credits', 'email', 'phone', 'description', 'projectType', 'projectValue', 'mapImageUrl', 'contactUrl', 'viewDetailsUrl', 'discountUrl'],
    },
    {
        key: EMAIL_TEMPLATE_KEYS.PASSWORD_RESET,
        label: 'Password Reset',
        variables: ['name', 'resetUrl'],
    },
    {
        key: EMAIL_TEMPLATE_KEYS.OTP_EMAIL,
        label: 'OTP Verification',
        variables: ['username', 'otp', 'expiresAt'],
    },
    {
        key: EMAIL_TEMPLATE_KEYS.LAWYER_PROMOTION,
        label: 'Lawyer Promotion',
        variables: ['name', 'role', 'dashboardUrl', 'appName'],
    },
    {
        key: EMAIL_TEMPLATE_KEYS.LAWYER_APPROVED,
        label: 'Lawyer Account Approved',
        variables: ['name', 'dashboardUrl'],
    },
    {
        key: EMAIL_TEMPLATE_KEYS.FIRM_PASSWORD_RESET,
        label: 'Firm Password Reset',
        variables: ['firmName', 'firmUserName', 'resetUrl'],
    },
    {
        key: EMAIL_TEMPLATE_KEYS.REQUEST_LAWYER_AS_FIRM_MEMBER,
        label: 'Lawyer Join Request (Firm)',
        variables: ['lawyerName', 'lawyerEmail', 'role', 'requestUrl'],
    },
    {
        key: EMAIL_TEMPLATE_KEYS.FIRM_REGISTRATION,
        label: 'Firm Registration',
        variables: ['firmAdmin', 'loginUrl', 'password', 'email'],
    },
    {
        key: EMAIL_TEMPLATE_KEYS.NEW_CLAIM_NOTIFICATION,
        label: 'New Claim Notification',
        variables: ['adminName', 'claimId', 'lawFirmName', 'claimerName', 'issueDescription'],
    },
    {
        key: EMAIL_TEMPLATE_KEYS.TUTORIAL_SYSTEM,
        label: 'Tutorial System',
        variables: ['name', 'dashboardUrl'],
    },
    {
        key: EMAIL_TEMPLATE_KEYS.COMPLETE_PROFILE,
        label: 'Complete Profile',
        variables: ['name', 'dashboardUrl'],
    },
    {
        key: EMAIL_TEMPLATE_KEYS.COMPLETE_PROFILE_REMINDER,
        label: 'Complete Profile Reminder',
        variables: ['name', 'dashboardUrl'],
    },
    {
        key: EMAIL_TEMPLATE_KEYS.HOW_TO_BID,
        label: 'How to Bid',
        variables: ['name', 'dashboardUrl'],
    },
    {
        key: EMAIL_TEMPLATE_KEYS.BUY_CREDIT,
        label: 'Buy Credit',
        variables: ['name', 'dashboardUrl'],
    },
    {
        key: EMAIL_TEMPLATE_KEYS.WIN_JOB,
        label: 'Win Job',
        variables: ['name', 'dashboardUrl'],
    },
    {
        key: EMAIL_TEMPLATE_KEYS.SUBSCRIPTION_BENEFITS,
        label: 'Subscription Benefits',
        variables: ['name', 'dashboardUrl'],
    },
    {
        key: EMAIL_TEMPLATE_KEYS.ELITE_PRO,
        label: 'Elite Pro',
        variables: ['name', 'dashboardUrl'],
    },
    {
        key: EMAIL_TEMPLATE_KEYS.INVOICE_DUE_21,
        label: 'Invoice Due 21 Days',
        variables: ['name', 'dashboardUrl'],
    },
    {
        key: EMAIL_TEMPLATE_KEYS.INVOICE_DUE_30,
        label: 'Invoice Due 30 Days',
        variables: ['name', 'dashboardUrl'],
    },
    {
        key: EMAIL_TEMPLATE_KEYS.HOW_TO_POST_CASE,
        label: 'How to Post Case',
        variables: ['name', 'dashboardUrl'],
    },
    {
        key: EMAIL_TEMPLATE_KEYS.SUBSCRIPTION_CONFIRMED,
        label: 'Subscription Confirmed',
        variables: ['name', 'planName', 'dashboardUrl'],
    },
];

export const emailTemplateSearchableFields = [
    'title',
    'templateKey',
    'subject',
    'body',
];

export type TEmailTemplateKey = (typeof EMAIL_TEMPLATE_KEYS)[keyof typeof EMAIL_TEMPLATE_KEYS];
