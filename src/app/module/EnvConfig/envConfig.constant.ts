// Environment configuration constants

export const ENV_CONFIG_GROUPS = {
    GENERAL: 'General',
    DATABASE: 'Database',
    SECURITY: 'Security',
    JWT: 'JWT',
    EMAIL: 'Email',
    STORAGE: 'Storage',
    PAYMENT: 'Payment',
    SMS: 'SMS & WhatsApp',
    MAPS: 'Maps & Location',
    FIRM: 'Firm Application',
    REDIS: 'Redis Cache',
} as const;

export const ENV_CONFIG_TYPES = {
    STRING: 'string',
    NUMBER: 'number',
    BOOLEAN: 'boolean',
    URL: 'url',
    EMAIL: 'email',
} as const;

// Environment variables that should NOT be stored in database
export const EXCLUDED_ENV_VARS = [
    'DATABASE_URL',
    'ENV_ENCRYPTION_KEY',
    'NODE_ENV',
];

// Sensitive fields that should be encrypted
export const SENSITIVE_FIELDS = [
    'JWT_ACCESS_SECRET',
    'JWT_REFRESH_SECRET',
    'DEFAULT_PASS',
    'ADMIN_PASSWORD',
    'MAILGUN_SMTP_PASS',
    'CLOUDINARY_API_SECRET',
    'DO_SPACES_SECRET_KEY',
    'STRIPE_SECRET_KEY',
    'STRIPE_WEBHOOK_SECRET',
    'TWILIO_AUTH',
    'GOOGLE_MAPS_API_KEY',
    'CLOUDINARY_API_KEY',
    'DO_SPACES_ACCESS_KEY',
];

// Settings that require application restart
export const RESTART_REQUIRED_FIELDS = [
    'PORT',
    'BCRYPT_SALT_ROUNDS',
    'DATABASE_URL',
    'REDIS_HOST',
    'REDIS_PORT',
    'REDIS_PASSWORD',
    'REDIS_USERNAME',
];

// Default configuration metadata
export const ENV_CONFIG_METADATA = [
    // General
    {
        key: 'DATABASE_URL',
        group: ENV_CONFIG_GROUPS.DATABASE,
        type: ENV_CONFIG_TYPES.URL,
        description: 'MongoDB connection string URL',
        isSensitive: true,
        requiresRestart: true,
    },
    {
        key: 'PORT',
        group: ENV_CONFIG_GROUPS.GENERAL,
        type: ENV_CONFIG_TYPES.NUMBER,
        description: 'Server port number',
        isSensitive: false,
        requiresRestart: true,
    },
    {
        key: 'CLIENT_SITE_URL',
        group: ENV_CONFIG_GROUPS.GENERAL,
        type: ENV_CONFIG_TYPES.URL,
        description: 'Client application URL',
        isSensitive: false,
        requiresRestart: false,
    },

    // Security
    {
        key: 'BCRYPT_SALT_ROUNDS',
        group: ENV_CONFIG_GROUPS.SECURITY,
        type: ENV_CONFIG_TYPES.NUMBER,
        description: 'Number of bcrypt salt rounds for password hashing',
        isSensitive: false,
        requiresRestart: true,
    },
    {
        key: 'DEFAULT_PASS',
        group: ENV_CONFIG_GROUPS.SECURITY,
        type: ENV_CONFIG_TYPES.STRING,
        description: 'Default password for system-generated accounts',
        isSensitive: true,
        requiresRestart: false,
    },

    // JWT
    {
        key: 'JWT_ACCESS_SECRET',
        group: ENV_CONFIG_GROUPS.JWT,
        type: ENV_CONFIG_TYPES.STRING,
        description: 'Secret key for JWT access tokens',
        isSensitive: true,
        requiresRestart: false,
    },
    {
        key: 'JWT_REFRESH_SECRET',
        group: ENV_CONFIG_GROUPS.JWT,
        type: ENV_CONFIG_TYPES.STRING,
        description: 'Secret key for JWT refresh tokens',
        isSensitive: true,
        requiresRestart: false,
    },
    {
        key: 'JWT_ACCESS_EXPIRES_IN',
        group: ENV_CONFIG_GROUPS.JWT,
        type: ENV_CONFIG_TYPES.STRING,
        description: 'JWT access token expiration time (e.g., 15m, 1h)',
        isSensitive: false,
        requiresRestart: false,
    },
    {
        key: 'JWT_REFRESH_EXPIRES_IN',
        group: ENV_CONFIG_GROUPS.JWT,
        type: ENV_CONFIG_TYPES.STRING,
        description: 'JWT refresh token expiration time (e.g., 7d, 30d)',
        isSensitive: false,
        requiresRestart: false,
    },

    // Admin
    {
        key: 'ADMIN_EMAIL',
        group: ENV_CONFIG_GROUPS.SECURITY,
        type: ENV_CONFIG_TYPES.EMAIL,
        description: 'Default admin email address',
        isSensitive: false,
        requiresRestart: false,
    },
    {
        key: 'ADMIN_PASSWORD',
        group: ENV_CONFIG_GROUPS.SECURITY,
        type: ENV_CONFIG_TYPES.STRING,
        description: 'Default admin password',
        isSensitive: true,
        requiresRestart: false,
    },

    // Email (Mailgun)
    {
        key: 'MAILGUN_SMTP_USER',
        group: ENV_CONFIG_GROUPS.EMAIL,
        type: ENV_CONFIG_TYPES.STRING,
        description: 'Mailgun SMTP username',
        isSensitive: false,
        requiresRestart: false,
    },
    {
        key: 'MAILGUN_SMTP_PASS',
        group: ENV_CONFIG_GROUPS.EMAIL,
        type: ENV_CONFIG_TYPES.STRING,
        description: 'Mailgun SMTP password',
        isSensitive: true,
        requiresRestart: false,
    },
    {
        key: 'MAILGUN_FROM_EMAIL',
        group: ENV_CONFIG_GROUPS.EMAIL,
        type: ENV_CONFIG_TYPES.EMAIL,
        description: 'From email address for outgoing emails',
        isSensitive: false,
        requiresRestart: false,
    },
    {
        key: 'RESET_PASS_UI_LINK',
        group: ENV_CONFIG_GROUPS.EMAIL,
        type: ENV_CONFIG_TYPES.URL,
        description: 'Password reset UI link',
        isSensitive: false,
        requiresRestart: false,
    },

    // Storage - Cloudinary
    {
        key: 'CLOUDINARY_CLOUD_NAME',
        group: ENV_CONFIG_GROUPS.STORAGE,
        type: ENV_CONFIG_TYPES.STRING,
        description: 'Cloudinary cloud name',
        isSensitive: false,
        requiresRestart: false,
    },
    {
        key: 'CLOUDINARY_API_KEY',
        group: ENV_CONFIG_GROUPS.STORAGE,
        type: ENV_CONFIG_TYPES.STRING,
        description: 'Cloudinary API key',
        isSensitive: true,
        requiresRestart: false,
    },
    {
        key: 'CLOUDINARY_API_SECRET',
        group: ENV_CONFIG_GROUPS.STORAGE,
        type: ENV_CONFIG_TYPES.STRING,
        description: 'Cloudinary API secret',
        isSensitive: true,
        requiresRestart: false,
    },

    // Storage - DigitalOcean Spaces
    {
        key: 'DO_SPACES_ACCESS_KEY',
        group: ENV_CONFIG_GROUPS.STORAGE,
        type: ENV_CONFIG_TYPES.STRING,
        description: 'DigitalOcean Spaces access key',
        isSensitive: true,
        requiresRestart: false,
    },
    {
        key: 'DO_SPACES_SECRET_KEY',
        group: ENV_CONFIG_GROUPS.STORAGE,
        type: ENV_CONFIG_TYPES.STRING,
        description: 'DigitalOcean Spaces secret key',
        isSensitive: true,
        requiresRestart: false,
    },
    {
        key: 'DO_SPACES_REGION',
        group: ENV_CONFIG_GROUPS.STORAGE,
        type: ENV_CONFIG_TYPES.STRING,
        description: 'DigitalOcean Spaces region',
        isSensitive: false,
        requiresRestart: false,
    },
    {
        key: 'DO_SPACES_ENDPOINT',
        group: ENV_CONFIG_GROUPS.STORAGE,
        type: ENV_CONFIG_TYPES.URL,
        description: 'DigitalOcean Spaces endpoint URL',
        isSensitive: false,
        requiresRestart: false,
    },
    {
        key: 'DO_SPACES_BUCKET',
        group: ENV_CONFIG_GROUPS.STORAGE,
        type: ENV_CONFIG_TYPES.STRING,
        description: 'DigitalOcean Spaces bucket name',
        isSensitive: false,
        requiresRestart: false,
    },
    {
        key: 'CUSTOM_CDN_DOMAIN',
        group: ENV_CONFIG_GROUPS.STORAGE,
        type: ENV_CONFIG_TYPES.URL,
        description: 'Custom CDN domain for assets',
        isSensitive: false,
        requiresRestart: false,
    },

    // Payment - Stripe
    {
        key: 'STRIPE_SECRET_KEY',
        group: ENV_CONFIG_GROUPS.PAYMENT,
        type: ENV_CONFIG_TYPES.STRING,
        description: 'Stripe secret key',
        isSensitive: true,
        requiresRestart: false,
    },
    {
        key: 'STRIPE_WEBHOOK_SECRET',
        group: ENV_CONFIG_GROUPS.PAYMENT,
        type: ENV_CONFIG_TYPES.STRING,
        description: 'Stripe webhook secret',
        isSensitive: true,
        requiresRestart: false,
    },
    {
        key: 'WEBHOOK_ENDPOINT',
        group: ENV_CONFIG_GROUPS.PAYMENT,
        type: ENV_CONFIG_TYPES.URL,
        description: 'Webhook endpoint URL',
        isSensitive: false,
        requiresRestart: false,
    },

    // SMS & WhatsApp - Twilio
    {
        key: 'TWILIO_SID',
        group: ENV_CONFIG_GROUPS.SMS,
        type: ENV_CONFIG_TYPES.STRING,
        description: 'Twilio account SID',
        isSensitive: false,
        requiresRestart: false,
    },
    {
        key: 'TWILIO_AUTH',
        group: ENV_CONFIG_GROUPS.SMS,
        type: ENV_CONFIG_TYPES.STRING,
        description: 'Twilio auth token',
        isSensitive: true,
        requiresRestart: false,
    },
    {
        key: 'TWILIO_PHONE',
        group: ENV_CONFIG_GROUPS.SMS,
        type: ENV_CONFIG_TYPES.STRING,
        description: 'Twilio phone number',
        isSensitive: false,
        requiresRestart: false,
    },

    // Maps
    {
        key: 'GOOGLE_MAPS_API_KEY',
        group: ENV_CONFIG_GROUPS.MAPS,
        type: ENV_CONFIG_TYPES.STRING,
        description: 'Google Maps API key',
        isSensitive: true,
        requiresRestart: false,
    },

    // Firm Application
    {
        key: 'FIRM_RESET_PASS_UI_LINK',
        group: ENV_CONFIG_GROUPS.FIRM,
        type: ENV_CONFIG_TYPES.URL,
        description: 'Firm app password reset link',
        isSensitive: false,
        requiresRestart: false,
    },
    {
        key: 'FIRM_CLIENT_URL',
        group: ENV_CONFIG_GROUPS.FIRM,
        type: ENV_CONFIG_TYPES.URL,
        description: 'Firm application URL',
        isSensitive: false,
        requiresRestart: false,
    },

    // Redis
    {
        key: 'REDIS_HOST',
        group: ENV_CONFIG_GROUPS.REDIS,
        type: ENV_CONFIG_TYPES.STRING,
        description: 'Redis server host',
        isSensitive: false,
        requiresRestart: true,
    },
    {
        key: 'REDIS_PORT',
        group: ENV_CONFIG_GROUPS.REDIS,
        type: ENV_CONFIG_TYPES.NUMBER,
        description: 'Redis server port',
        isSensitive: false,
        requiresRestart: true,
    },
    {
        key: 'REDIS_PASSWORD',
        group: ENV_CONFIG_GROUPS.REDIS,
        type: ENV_CONFIG_TYPES.STRING,
        description: 'Redis server password',
        isSensitive: true,
        requiresRestart: true,
    },
    {
        key: 'REDIS_USERNAME',
        group: ENV_CONFIG_GROUPS.REDIS,
        type: ENV_CONFIG_TYPES.STRING,
        description: 'Redis server username',
        isSensitive: false,
        requiresRestart: true,
    },
];
