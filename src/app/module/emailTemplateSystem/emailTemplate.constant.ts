export const EMAIL_TEMPLATE_KEYS = {
    // ─── Generic / Auth ──────────────────────────────────────────────────────────
    VERIFY_EMAIL: 'verify_email',
    PASSWORD_RESET: 'password_reset',
    OTP_EMAIL: 'otp_email',
    // ─── Client ──────────────────────────────────────────────────────────────────
    WELCOME_TO_CLIENT: 'welcome_to_client', // Client Welcome / Thank you
    WELCOME_LEAD_SUBMISSION: 'welcome_Lead_submission',
    CLIENT_DELAYED_ACTIVATION: 'client_delayed_activation',
    HOW_TO_FIND_RIGHT_LAWYER: 'how_to_find_right_lawyer',
    HOW_TO_POST_CASE: 'how_to_post_case',
    // ─── Lawyer ──────────────────────────────────────────────────────────────────
    WELCOME_TO_LAWYER: 'welcome_to_lawyer', // Lawyer Welcome
    WELCOME_TO_LAWYER_BY_MARKETER: 'welcome_to_lawyer_by_marketer',
    LAWYER_DELAYED_ACTIVATION: 'lawyer_delayed_activation',
    LAWYER_APPROVED: 'lawyer_approved', // Lawyer Activation Thank you
    COMPLETE_PROFILE_REMINDER: 'complete_profile_reminder',
    HOW_TO_BID: 'how_to_bid',
    BUY_CREDIT: 'buy_credit',
    WIN_JOB: 'win_job',
    HOW_TO_BE_SUBSCRIBED_USER: 'how_to_be_subscribed_user',
    SUBSCRIPTION_BENEFITS: 'subscription_benefits',
    ELITE_PRO: 'elite_pro',
    BENEFIT_OF_ELITE_PRO_MEMBER: 'benefit_of_elite_pro_member',
    THOUSAND_CASES_WAITING: 'thousand_cases_waiting',
    LAWYER_PROMOTION: 'lawyerPromotion',
    TUTORIAL_SYSTEM: 'tutorial_system',
    // ─── Firm ────────────────────────────────────────────────────────────────────
    FIRM_REGISTRATION: 'firm_registration',
    FIRM_PASSWORD_RESET: 'firm_password_reset',
    REQUEST_LAWYER_AS_FIRM_MEMBER: 'request_lawyer_as_firm_member',
    // ─── Lead / Case ─────────────────────────────────────────────────────────────
    NEW_LEAD_ALERT: 'new_lead_alert',
    // ─── Contact / Interaction ───────────────────────────────────────────────────
    CONTACT: 'contact',
    PUBLIC_CONTACT: 'public-contact',
    // ─── Subscription & Billing ──────────────────────────────────────────────────
    SUBSCRIPTION_CREATED: 'subscription_created',
    SUBSCRIPTION_RENEWED: 'subscription_renewed',
    SUBSCRIPTION_PAYMENT_FAILED: 'subscription_payment_failed',
    SUBSCRIPTION_CANCELED: 'subscription_canceled',
    SUBSCRIPTION_CHANGED: 'subscription_changed',
    SUBSCRIPTION_RENEWAL_REMINDER: 'subscription_renewal_reminder',
    SUBSCRIPTION_EXPIRED: 'subscription_expired',
    SUBSCRIPTION_CONFIRMED: 'subscription_confirmed',
    INVOICE_DUE_21: 'invoice_due_21',
    INVOICE_DUE_30: 'invoice_due_30',
    // ─── Credits ─────────────────────────────────────────────────────────────────
    CREDITS_PURCHASED: 'credits_purchased',
    CREDITS_LOW_WARNING: 'credits_low_warning',
    // ─── Admin / Promotional / Event ─────────────────────────────────────────────
    ADMIN_CUSTOM: 'admin_custom',
    NEW_CLAIM_NOTIFICATION: 'new_claim_notification',
    SPECIAL_EVENTS_EMAIL: 'special_events_email',
} as const;

export const EMAIL_TEMPLATES = [
    // ─── Generic / Auth ──────────────────────────────────────────────────────────
    {
        key: EMAIL_TEMPLATE_KEYS.VERIFY_EMAIL,
        label: 'Email Verification',
        variables: ['name', 'verifyUrl', 'role'],
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

    // ─── Client ──────────────────────────────────────────────────────────────────
    {
        key: EMAIL_TEMPLATE_KEYS.WELCOME_TO_CLIENT,
        label: 'Welcome / Thank You Email – Client',
        variables: ['name', 'email', 'defaultPassword', 'dashboardUrl'],
    },
    {
        key: EMAIL_TEMPLATE_KEYS.WELCOME_LEAD_SUBMISSION,
        label: 'Welcome – Lead Submission (Client)',
        variables: [
            'name', 'caseType', 'leadAnswer', 'preferredContactTime',
            'additionalDetails', 'dashboardUrl', 'appName',
        ],
    },
    {
        key: EMAIL_TEMPLATE_KEYS.CLIENT_DELAYED_ACTIVATION,
        label: 'Your Profile Activation is Pending',
        variables: ['name'],
    },
    {
        key: EMAIL_TEMPLATE_KEYS.HOW_TO_FIND_RIGHT_LAWYER,
        label: 'How to Find the Right Lawyer',
        variables: ['name', 'dashboardUrl'],
    },
    {
        key: EMAIL_TEMPLATE_KEYS.HOW_TO_POST_CASE,
        label: 'How to Post Case',
        variables: ['name', 'dashboardUrl'],
    },

    // ─── Lawyer ──────────────────────────────────────────────────────────────────
    {
        key: EMAIL_TEMPLATE_KEYS.WELCOME_TO_LAWYER,
        label: 'While Registration - Welcome Email',
        variables: ['name', 'practiceArea', 'dashboardUrl'],
    },
    {
        key: EMAIL_TEMPLATE_KEYS.WELCOME_TO_LAWYER_BY_MARKETER,
        label: 'Welcome – Lawyer (by Marketer)',
        variables: [
            'name', 'email', 'defaultPassword', 'practiceArea',
            'dashboardUrl', 'appName',
        ],
    },
    {
        key: EMAIL_TEMPLATE_KEYS.LAWYER_DELAYED_ACTIVATION,
        label: 'Confirmation Email (if there\'s a delay to activate)',
        variables: ['name'],
    },
    {
        key: EMAIL_TEMPLATE_KEYS.LAWYER_APPROVED,
        label: 'After Registration (after activation) - Thank you email',
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
        label: 'How to Buy Credits and Start Bidding',
        variables: ['name', 'dashboardUrl'],
    },
    {
        key: EMAIL_TEMPLATE_KEYS.WIN_JOB,
        label: 'How to Get More Cases on The Law App',
        variables: ['name', 'dashboardUrl'],
    },
    {
        key: EMAIL_TEMPLATE_KEYS.HOW_TO_BE_SUBSCRIBED_USER,
        label: 'Unlock Advanced Features by Becoming a Subscribed User',
        variables: ['name', 'dashboardUrl'],
    },
    {
        key: EMAIL_TEMPLATE_KEYS.SUBSCRIPTION_BENEFITS,
        label: 'Why Should You Become a Subscribed User?',
        variables: ['name', 'dashboardUrl'],
    },
    {
        key: EMAIL_TEMPLATE_KEYS.ELITE_PRO,
        label: 'Become an Elite Pro Member and Take Your Practice to the Next Level',
        variables: ['name', 'dashboardUrl'],
    },
    {
        key: EMAIL_TEMPLATE_KEYS.BENEFIT_OF_ELITE_PRO_MEMBER,
        label: 'What Is the Benefit of Elite Pro Member',
        variables: ['name', 'dashboardUrl'],
    },
    {
        key: EMAIL_TEMPLATE_KEYS.THOUSAND_CASES_WAITING,
        label: '1,000 Cases Waiting for You',
        variables: ['name', 'dashboardUrl'],
    },
    {
        key: EMAIL_TEMPLATE_KEYS.LAWYER_PROMOTION,
        label: 'Lawyer Profile Promotion',
        variables: ['name', 'role', 'dashboardUrl', 'appName'],
    },
    {
        key: EMAIL_TEMPLATE_KEYS.TUTORIAL_SYSTEM,
        label: 'Tutorial System',
        variables: ['name', 'dashboardUrl'],
    },

    // ─── Firm ────────────────────────────────────────────────────────────────────
    {
        key: EMAIL_TEMPLATE_KEYS.FIRM_REGISTRATION,
        label: 'Firm – Registration',
        variables: ['firmAdmin', 'email', 'password', 'loginUrl'],
    },
    {
        key: EMAIL_TEMPLATE_KEYS.FIRM_PASSWORD_RESET,
        label: 'Firm – Password Reset',
        variables: ['firmName', 'firmUserName', 'resetUrl'],
    },
    {
        key: EMAIL_TEMPLATE_KEYS.REQUEST_LAWYER_AS_FIRM_MEMBER,
        label: 'Firm – Lawyer Join Request',
        variables: ['lawyerName', 'lawyerEmail', 'role', 'requestUrl'],
    },

    // ─── Lead / Case ─────────────────────────────────────────────────────────────
    {
        key: EMAIL_TEMPLATE_KEYS.NEW_LEAD_ALERT,
        label: 'New Lead Alert (Lawyer)',
        variables: [
            'clientName', 'lawyerType', 'location', 'credits',
            'email', 'phone', 'description', 'projectType',
            'projectValue', 'mapImageUrl', 'contactUrl',
            'viewDetailsUrl', 'discountUrl',
        ],
    },

    // ─── Contact / Interaction ───────────────────────────────────────────────────
    {
        key: EMAIL_TEMPLATE_KEYS.CONTACT,
        label: 'Lawyer–Client Interaction',
        variables: [
            'name', 'userRole', 'dashboardUrl', 'senderName',
            'timestamp', 'message',
        ],
    },
    {
        key: EMAIL_TEMPLATE_KEYS.PUBLIC_CONTACT,
        label: 'Public Contact Form',
        variables: ['name', 'email', 'phone', 'message'],
    },

    // ─── Subscription & Billing ──────────────────────────────────────────────────
    {
        key: EMAIL_TEMPLATE_KEYS.SUBSCRIPTION_CREATED,
        label: 'Subscription Created',
        variables: [
            'name', 'planName', 'amount', 'currency',
            'periodStart', 'periodEnd', 'invoicePdfUrl', 'dashboardUrl',
        ],
    },
    {
        key: EMAIL_TEMPLATE_KEYS.SUBSCRIPTION_RENEWED,
        label: 'Subscription Renewed',
        variables: [
            'name', 'planName', 'amount', 'currency',
            'nextRenewalDate', 'invoicePdfUrl', 'dashboardUrl',
        ],
    },
    {
        key: EMAIL_TEMPLATE_KEYS.SUBSCRIPTION_PAYMENT_FAILED,
        label: 'Subscription Payment Failed',
        variables: ['name', 'planName', 'updatePaymentUrl'],
    },
    {
        key: EMAIL_TEMPLATE_KEYS.SUBSCRIPTION_CANCELED,
        label: 'Subscription Canceled',
        variables: ['name', 'planName', 'canceledAt', 'reactivateUrl'],
    },
    {
        key: EMAIL_TEMPLATE_KEYS.SUBSCRIPTION_CHANGED,
        label: 'Subscription Plan Changed',
        variables: [
            'name', 'oldPlanName', 'newPlanName', 'amount',
            'currency', 'periodStart', 'periodEnd', 'dashboardUrl',
        ],
    },
    {
        key: EMAIL_TEMPLATE_KEYS.SUBSCRIPTION_RENEWAL_REMINDER,
        label: 'Subscription Renewal Reminder',
        variables: [
            'name', 'planName', 'daysLeft', 'renewalDate',
            'amount', 'currency', 'dashboardUrl',
        ],
    },
    {
        key: EMAIL_TEMPLATE_KEYS.SUBSCRIPTION_EXPIRED,
        label: 'Subscription Expired',
        variables: ['name', 'planName', 'expiredAt', 'reactivateUrl'],
    },
    {
        key: EMAIL_TEMPLATE_KEYS.SUBSCRIPTION_CONFIRMED,
        label: 'Subscription Confirmed',
        variables: ['name', 'planName', 'dashboardUrl'],
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

    // ─── Credits ─────────────────────────────────────────────────────────────────
    {
        key: EMAIL_TEMPLATE_KEYS.CREDITS_PURCHASED,
        label: 'Credits Purchased',
        variables: [
            'name', 'credits', 'amount', 'currency', 'dashboardUrl',
        ],
    },
    {
        key: EMAIL_TEMPLATE_KEYS.CREDITS_LOW_WARNING,
        label: 'Low Credits Warning',
        variables: ['name', 'credits', 'dashboardUrl'],
    },

    // ─── Admin / Promotional / Event ─────────────────────────────────────────────
    {
        key: EMAIL_TEMPLATE_KEYS.ADMIN_CUSTOM,
        label: 'Custom Admin Message',
        variables: [
            'name', 'headline', 'body', 'ctaLabel',
            'ctaUrl', 'footerText',
        ],
    },
    {
        key: EMAIL_TEMPLATE_KEYS.NEW_CLAIM_NOTIFICATION,
        label: 'New Claim Notification (Admin)',
        variables: [
            'adminName', 'claimId', 'lawFirmName', 'claimerName',
            'issueDescription',
        ],
    },
    {
        key: EMAIL_TEMPLATE_KEYS.SPECIAL_EVENTS_EMAIL,
        label: 'Special Events Email',
        variables: ['name', 'dashboardUrl'],
    },
];

export const emailTemplateSearchableFields = [
    'title',
    'templateKey',
    'subject',
    'body',
];

export type TEmailTemplateKey = (typeof EMAIL_TEMPLATE_KEYS)[keyof typeof EMAIL_TEMPLATE_KEYS];

