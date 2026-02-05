import dotenv from 'dotenv';
import path from 'path';
import { envConfigService } from './envConfig.service';
import { EXCLUDED_ENV_VARS } from './envConfig.constant';

dotenv.config({ path: path.join(process.cwd(), '.env') });

class EnvConfigLoader {
    private configCache: Record<string, string> = {};
    private isInitialized = false;
    private useEnvFallback = false;

    /**
     * Initialize configuration loader
     * Loads configs from database with fallback to .env file
     */
    async initialize(): Promise<void> {
        try {
            console.log('🔧 Initializing environment configuration...');

            // Load configurations from database
            const configs = await envConfigService.getAllConfigs();

            // Check if database has configs
            const hasConfigs = Object.keys(configs).length > 0;

            if (!hasConfigs) {
                console.warn('⚠️ No configurations found in database. Using .env file.');
                this.useEnvFallback = true;
                this.loadFromEnv();
            } else {
                // Flatten grouped configs into cache
                Object.values(configs).forEach((group) => {
                    group.forEach((config) => {
                        // Get actual decrypted value for sensitive configs
                        if (config.isSensitive) {
                            // Fetch individual config to get decrypted value
                            envConfigService.getConfigByKey(config.key).then((fullConfig) => {
                                if (fullConfig) {
                                    this.configCache[config.key] = fullConfig.value;
                                }
                            });
                        } else {
                            this.configCache[config.key] = config.value;
                        }
                    });
                });

                // Also load excluded vars from .env
                EXCLUDED_ENV_VARS.forEach((key) => {
                    if (process.env[key]) {
                        this.configCache[key] = process.env[key] as string;
                    }
                });

                console.log(`✅ Loaded ${Object.keys(this.configCache).length} configurations from database`);
            }

            this.isInitialized = true;
        } catch (error) {
            console.error('❌ Failed to initialize config loader:', error);
            console.warn('⚠️ Falling back to .env file');
            this.useEnvFallback = true;
            this.loadFromEnv();
            this.isInitialized = true;
        }
    }

    /**
     * Load configurations from .env file
     */
    private loadFromEnv(): void {
        this.configCache = {
            NODE_ENV: process.env.NODE_ENV || 'development',
            PORT: process.env.PORT || '5000',
            DATABASE_URL: process.env.DATABASE_URL || '',
            BCRYPT_SALT_ROUNDS: process.env.BCRYPT_SALT_ROUNDS || '10',
            DEFAULT_PASS: process.env.DEFAULT_PASS || '',
            JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || '',
            JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || '',
            JWT_ACCESS_EXPIRES_IN: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
            JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
            RESET_PASS_UI_LINK: process.env.RESET_PASS_UI_LINK || '',
            ADMIN_EMAIL: process.env.ADMIN_EMAIL || '',
            ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || '',
            MAILGUN_SMTP_USER: process.env.MAILGUN_SMTP_USER || '',
            MAILGUN_SMTP_PASS: process.env.MAILGUN_SMTP_PASS || '',
            MAILGUN_FROM_EMAIL: process.env.MAILGUN_FROM_EMAIL || '',
            CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || '',
            CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || '',
            CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || '',
            CLIENT_SITE_URL: process.env.CLIENT_SITE_URL || '',
            DO_SPACES_ACCESS_KEY: process.env.DO_SPACES_ACCESS_KEY || '',
            DO_SPACES_SECRET_KEY: process.env.DO_SPACES_SECRET_KEY || '',
            DO_SPACES_REGION: process.env.DO_SPACES_REGION || '',
            DO_SPACES_ENDPOINT: process.env.DO_SPACES_ENDPOINT || '',
            DO_SPACES_BUCKET: process.env.DO_SPACES_BUCKET || '',
            FIRM_RESET_PASS_UI_LINK: process.env.FIRM_RESET_PASS_UI_LINK || '',
            FIRM_CLIENT_URL: process.env.FIRM_CLIENT_URL || '',
            GOOGLE_MAPS_API_KEY: process.env.GOOGLE_MAPS_API_KEY || '',
            REDIS_HOST: process.env.REDIS_HOST || '',
            REDIS_PORT: process.env.REDIS_PORT || '6379',
            REDIS_PASSWORD: process.env.REDIS_PASSWORD || '',
            REDIS_USERNAME: process.env.REDIS_USERNAME || 'default',
            CUSTOM_CDN_DOMAIN: process.env.CUSTOM_CDN_DOMAIN || '',
            STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY || '',
            STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET || '',
            WEBHOOK_ENDPOINT: process.env.WEBHOOK_ENDPOINT || '',
            TWILIO_SID: process.env.TWILIO_SID || '',
            TWILIO_AUTH: process.env.TWILIO_AUTH || '',
            TWILIO_PHONE: process.env.TWILIO_PHONE || '',
        };
    }

    /**
     * Get configuration value by key
     */
    getConfig(key: string): string | undefined {
        if (!this.isInitialized) {
            console.warn('⚠️ Config loader not initialized. Using process.env');
            return process.env[key];
        }
        return this.configCache[key];
    }

    /**
     * Get all configurations as object
     */
    getConfigObject(): Record<string, string | undefined> {
        if (!this.isInitialized) {
            console.warn('⚠️ Config loader not initialized. Using process.env');
            return process.env as Record<string, string>;
        }
        return this.configCache;
    }

    /**
     * Reload configurations from database
     */
    async reload(): Promise<void> {
        this.isInitialized = false;
        this.configCache = {};
        await this.initialize();
    }

    /**
     * Check if using fallback mode
     */
    isUsingFallback(): boolean {
        return this.useEnvFallback;
    }
}

// Export singleton instance
export const envConfigLoader = new EnvConfigLoader();
