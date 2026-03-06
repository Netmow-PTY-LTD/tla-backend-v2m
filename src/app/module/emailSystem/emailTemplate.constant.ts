export const EMAIL_TEMPLATE_KEYS = {
    // Auth / Registration
    WELCOME_LEAD_SUBMISSION: 'welcome_Lead_submission',
    WELCOME_TO_CLIENT: 'welcome_to_client',
    WELCOME_TO_LAWYER: 'welcome_to_lawyer',
    WELCOME_TO_LAWYER_BY_MARKETER: 'welcome_to_lawyer_by_marketer',
    VERIFY_EMAIL: 'verify_email',
    PASSWORD_RESET: 'password_reset',
    OTP_EMAIL: 'otp_email',
    LAWYER_PROMOTION: 'lawyerPromotion',
    LAWYER_APPROVED: 'lawyer_approved',

    // Contact / Interaction
    CONTACT: 'contact',
    PUBLIC_CONTACT: 'public-contact',

    // Lead
    NEW_LEAD_ALERT: 'new_lead_alert',

    // Firm
    FIRM_PASSWORD_RESET: 'firm_password_reset',
    REQUEST_LAWYER_AS_FIRM_MEMBER: 'request_lawyer_as_firm_member',
    FIRM_REGISTRATION: 'firm_registration',
    NEW_CLAIM_NOTIFICATION: 'new_claim_notification',

    // Subscription lifecycle
    SUBSCRIPTION_CREATED: 'subscription_created',
    SUBSCRIPTION_RENEWED: 'subscription_renewed',
    SUBSCRIPTION_PAYMENT_FAILED: 'subscription_payment_failed',
    SUBSCRIPTION_CANCELED: 'subscription_canceled',
    SUBSCRIPTION_CHANGED: 'subscription_changed',
    SUBSCRIPTION_RENEWAL_REMINDER: 'subscription_renewal_reminder',
    SUBSCRIPTION_EXPIRED: 'subscription_expired',

    // Credits
    CREDITS_PURCHASED: 'credits_purchased',
    CREDITS_LOW_WARNING: 'credits_low_warning',

    // Admin Custom Campaign
    ADMIN_CUSTOM: 'admin_custom',

    // Email flow / drip campaigns (BullMQ automated)
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
    // ─── Auth / Registration ───────────────────────────────────────────────────

    {
        key: EMAIL_TEMPLATE_KEYS.WELCOME_LEAD_SUBMISSION,
        label: 'Welcome – Lead Submission (Client)',
        variables: [
            'name',           // client full name
            'caseType',       // service / legal area name
            'leadAnswer',     // formatted HTML of questionnaire answers
            'preferredContactTime', // lead priority / contact time
            'additionalDetails',    // extra notes from client
            'dashboardUrl',   // link to client dashboard
            'appName',        // application name
        ],
    },
    {
        key: EMAIL_TEMPLATE_KEYS.WELCOME_TO_CLIENT,
        label: 'Welcome – Client',
        variables: [
            'name',           // client full name
            'email',          // client email address
            'defaultPassword', // auto-generated password
            'dashboardUrl',   // link to client dashboard
        ],
    },
    {
        key: EMAIL_TEMPLATE_KEYS.WELCOME_TO_LAWYER,
        label: 'Welcome – Lawyer',
        variables: [
            'name',           // lawyer full name
            'paracticeArea',  // array / list of selected services
            'dashboardUrl',   // link to lawyer dashboard
        ],
    },
    {
        key: EMAIL_TEMPLATE_KEYS.WELCOME_TO_LAWYER_BY_MARKETER,
        label: 'Welcome – Lawyer (by Marketer)',
        variables: [
            'name',           // lawyer full name
            'email',          // lawyer email
            'defaultPassword', // plain-text password set by marketer
            'paracticeArea',  // array / list of selected services
            'dashboardUrl',   // link to lawyer dashboard
            'appName',        // application name
        ],
    },
    {
        key: EMAIL_TEMPLATE_KEYS.VERIFY_EMAIL,
        label: 'Email Verification',
        variables: [
            'name',           // user full name
            'verifyUrl',      // full verification URL with token/code
            'role',           // user role (Lawyer | Client)
        ],
    },
    {
        key: EMAIL_TEMPLATE_KEYS.PASSWORD_RESET,
        label: 'Password Reset',
        variables: [
            'name',           // user full name
            'resetUrl',       // password-reset URL with token
        ],
    },
    {
        key: EMAIL_TEMPLATE_KEYS.OTP_EMAIL,
        label: 'OTP Verification',
        variables: [
            'username',       // user display name / email
            'otp',            // 6-digit OTP code
            'expiresAt',      // formatted expiry time string
        ],
    },
    {
        key: EMAIL_TEMPLATE_KEYS.LAWYER_PROMOTION,
        label: 'Lawyer Profile Promotion',
        variables: [
            'name',           // lawyer full name
            'role',           // new profile tier (Expert Lawyer / Premium Lawyer)
            'dashboardUrl',   // link to lawyer dashboard
            'appName',        // application name
        ],
    },
    {
        key: EMAIL_TEMPLATE_KEYS.LAWYER_APPROVED,
        label: 'Lawyer Account Approved',
        variables: [
            'name',           // lawyer full name
            'dashboardUrl',   // link to lawyer dashboard
        ],
    },

    // ─── Contact / Interaction ─────────────────────────────────────────────────

    {
        key: EMAIL_TEMPLATE_KEYS.CONTACT,
        label: 'Lawyer–Client Interaction',
        variables: [
            'name',           // recipient full name
            'userRole',       // recipient role (regUserType)
            'dashboardUrl',   // contextual dashboard link
            'senderName',     // name of person who sent the message
            'timestamp',      // locale-formatted date/time string
            'message',        // email body text (emailText)
        ],
    },
    {
        key: EMAIL_TEMPLATE_KEYS.PUBLIC_CONTACT,
        label: 'Public Contact Form',
        variables: [
            'name',           // sender full name
            'email',          // sender email
            'phone',          // sender phone (optional)
            'message',        // message content
        ],
    },

    // ─── Lead ──────────────────────────────────────────────────────────────────

    {
        key: EMAIL_TEMPLATE_KEYS.NEW_LEAD_ALERT,
        label: 'New Lead Alert (Lawyer)',
        variables: [
            'clientName',     // client full name
            'lawyerType',     // service / practice area
            'location',       // suburb / zipcode area
            'credits',        // credits required to respond
            'email',          // masked client email
            'phone',          // masked client phone
            'description',    // additional details / project notes
            'projectType',    // lead priority / project type
            'projectValue',   // budget amount
            'mapImageUrl',    // static map image URL
            'contactUrl',     // link to respond to this lead
            'viewDetailsUrl', // link to full lead details
            'discountUrl',    // promotional / upsell link
        ],
    },

    // ─── Firm ──────────────────────────────────────────────────────────────────

    {
        key: EMAIL_TEMPLATE_KEYS.FIRM_PASSWORD_RESET,
        label: 'Firm – Password Reset',
        variables: [
            'firmName',       // firm display name
            'firmUserName',   // firm user's name
            'resetUrl',       // password-reset URL with token
        ],
    },
    {
        key: EMAIL_TEMPLATE_KEYS.REQUEST_LAWYER_AS_FIRM_MEMBER,
        label: 'Firm – Lawyer Join Request',
        variables: [
            'lawyerName',     // lawyer's full name
            'lawyerEmail',    // lawyer's email address
            'role',           // requested role (e.g. Lawyer)
            'requestUrl',     // link to review the request in firm portal
        ],
    },
    {
        key: EMAIL_TEMPLATE_KEYS.FIRM_REGISTRATION,
        label: 'Firm – Registration',
        variables: [
            'firmAdmin',      // firm admin's name
            'email',          // firm login email
            'password',       // plain-text initial password
            'loginUrl',       // link to firm portal login page
        ],
    },
    {
        key: EMAIL_TEMPLATE_KEYS.NEW_CLAIM_NOTIFICATION,
        label: 'New Claim Notification (Admin)',
        variables: [
            'adminName',      // receiving admin's name
            'claimId',        // unique claim identifier
            'lawFirmName',    // name of the firm being claimed
            'claimerName',    // person who submitted the claim
            'issueDescription', // detailed description of the issue
        ],
    },

    // ─── Subscription lifecycle ────────────────────────────────────────────────

    {
        key: EMAIL_TEMPLATE_KEYS.SUBSCRIPTION_CREATED,
        label: 'Subscription Created',
        variables: [
            'name',           // subscriber's full name
            'planName',       // subscription plan name
            'amount',         // charged amount
            'currency',       // currency code (e.g. AUD)
            'periodStart',    // subscription start date string
            'periodEnd',      // subscription end date string
            'invoicePdfUrl',  // URL to download invoice PDF
            'dashboardUrl',   // link to subscription/dashboard
        ],
    },
    {
        key: EMAIL_TEMPLATE_KEYS.SUBSCRIPTION_RENEWED,
        label: 'Subscription Renewed',
        variables: [
            'name',           // subscriber's full name
            'planName',       // subscription plan name
            'amount',         // renewal charge amount
            'currency',       // currency code
            'nextRenewalDate', // date of next renewal
            'invoicePdfUrl',  // URL to download invoice PDF
            'dashboardUrl',   // link to subscription/dashboard
        ],
    },
    {
        key: EMAIL_TEMPLATE_KEYS.SUBSCRIPTION_PAYMENT_FAILED,
        label: 'Subscription Payment Failed',
        variables: [
            'name',           // subscriber's full name
            'planName',       // subscription plan name
            'updatePaymentUrl', // link to update payment method
        ],
    },
    {
        key: EMAIL_TEMPLATE_KEYS.SUBSCRIPTION_CANCELED,
        label: 'Subscription Canceled',
        variables: [
            'name',           // subscriber's full name
            'planName',       // subscription plan name
            'canceledAt',     // cancellation date string
            'reactivateUrl',  // link to reactivate the subscription
        ],
    },
    {
        key: EMAIL_TEMPLATE_KEYS.SUBSCRIPTION_CHANGED,
        label: 'Subscription Plan Changed',
        variables: [
            'name',           // subscriber's full name
            'oldPlanName',    // previous plan name
            'newPlanName',    // new plan name
            'amount',         // new plan charge amount
            'currency',       // currency code
            'periodStart',    // new period start date
            'periodEnd',      // new period end date
            'dashboardUrl',   // link to subscription/dashboard
        ],
    },
    {
        key: EMAIL_TEMPLATE_KEYS.SUBSCRIPTION_RENEWAL_REMINDER,
        label: 'Subscription Renewal Reminder',
        variables: [
            'name',           // subscriber's full name
            'planName',       // subscription plan name
            'daysLeft',       // days until renewal
            'renewalDate',    // renewal date string
            'amount',         // renewal charge amount
            'currency',       // currency code
            'dashboardUrl',   // link to subscription/dashboard
        ],
    },
    {
        key: EMAIL_TEMPLATE_KEYS.SUBSCRIPTION_EXPIRED,
        label: 'Subscription Expired',
        variables: [
            'name',           // subscriber's full name
            'planName',       // subscription plan name
            'expiredAt',      // expiry date string
            'reactivateUrl',  // link to re-subscribe
        ],
    },

    // ─── Credits ───────────────────────────────────────────────────────────────

    {
        key: EMAIL_TEMPLATE_KEYS.CREDITS_PURCHASED,
        label: 'Credits Purchased',
        variables: [
            'name',           // user's full name
            'credits',        // number of credits purchased
            'amount',         // amount paid
            'currency',       // currency code
            'dashboardUrl',   // link to credits/dashboard
        ],
    },
    {
        key: EMAIL_TEMPLATE_KEYS.CREDITS_LOW_WARNING,
        label: 'Low Credits Warning',
        variables: [
            'name',           // user's full name
            'credits',        // remaining credits count
            'dashboardUrl',   // link to buy more credits
        ],
    },

    // ─── Admin Custom Campaign ─────────────────────────────────────────────────

    {
        key: EMAIL_TEMPLATE_KEYS.ADMIN_CUSTOM,
        label: 'Custom Admin Message',
        variables: [
            'name',           // recipient's full name
            'headline',       // email headline / subject line (optional)
            'body',           // main message body text
            'ctaLabel',       // call-to-action button label (optional)
            'ctaUrl',         // call-to-action URL (optional)
            'footerText',     // footer note (optional)
        ],
    },

    // ─── Email flow / drip campaigns ──────────────────────────────────────────

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
