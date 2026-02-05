import crypto from 'crypto';
import { redisClient } from '../../config/redis.config';
import { EnvConfig } from './envConfig.model';
import { IEnvConfig, IEnvConfigGrouped, IEnvConfigUpdate } from './envConfig.interface';
import { SENSITIVE_FIELDS } from './envConfig.constant';
import { Types } from 'mongoose';

// Encryption/Decryption utilities
const ALGORITHM = 'aes-256-cbc';
const ENCRYPTION_KEY = process.env.ENV_ENCRYPTION_KEY || '';

if (!ENCRYPTION_KEY || ENCRYPTION_KEY.length !== 64) {
    console.warn('⚠️ ENV_ENCRYPTION_KEY not set or invalid. Using fallback (NOT SECURE!)');
}

const encryptValue = (value: string): string => {
    if (!ENCRYPTION_KEY) return value;

    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(
        ALGORITHM,
        Buffer.from(ENCRYPTION_KEY, 'hex'),
        iv
    );

    let encrypted = cipher.update(value, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    return `${iv.toString('hex')}:${encrypted}`;
};

const decryptValue = (encryptedValue: string): string => {
    if (!ENCRYPTION_KEY) return encryptedValue;

    try {
        const [ivHex, encrypted] = encryptedValue.split(':');
        const iv = Buffer.from(ivHex, 'hex');
        const decipher = crypto.createDecipheriv(
            ALGORITHM,
            Buffer.from(ENCRYPTION_KEY, 'hex'),
            iv
        );

        let decrypted = decipher.update(encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');

        return decrypted;
    } catch (error) {
        console.error('❌ Decryption failed:', error);
        return encryptedValue;
    }
};

// Cache utilities
const CACHE_PREFIX = 'ENV_CONFIG';
const CACHE_TTL = 300; // 5 minutes

const getCacheKey = (key?: string) => {
    return key ? `${CACHE_PREFIX}:${key}` : `${CACHE_PREFIX}:ALL`;
};

const invalidateCache = async (key?: string) => {
    try {
        if (key) {
            await redisClient.del(getCacheKey(key));
        } else {
            const keys = await redisClient.keys(`${CACHE_PREFIX}:*`);
            if (keys.length > 0) {
                await redisClient.del(keys);
            }
        }
    } catch (error) {
        console.error('❌ Cache invalidation failed:', error);
    }
};

// Get all configurations grouped by category
const getAllConfigs = async (): Promise<IEnvConfigGrouped> => {
    try {
        // Try cache first
        const cached = await redisClient.get(getCacheKey());
        if (cached) {
            return JSON.parse(cached);
        }

        const configs = await EnvConfig.find({ isActive: true }).lean();

        const grouped: IEnvConfigGrouped = {};

        configs.forEach((config) => {
            if (!grouped[config.group]) {
                grouped[config.group] = [];
            }

            grouped[config.group].push({
                key: config.key,
                value: config.isSensitive ? '***MASKED***' : config.value,
                type: config.type,
                isSensitive: config.isSensitive,
                requiresRestart: config.requiresRestart,
                description: config.description,
                isActive: config.isActive,
            });
        });

        // Cache the result
        await redisClient.setex(getCacheKey(), CACHE_TTL, JSON.stringify(grouped));

        return grouped;
    } catch (error) {
        console.error('❌ Error fetching configs:', error);
        throw new Error('Failed to fetch environment configurations');
    }
};

// Get single configuration by key (with decrypted value)
const getConfigByKey = async (key: string): Promise<IEnvConfig | null> => {
    try {
        // Try cache first
        const cached = await redisClient.get(getCacheKey(key));
        if (cached) {
            return JSON.parse(cached);
        }

        const config = await EnvConfig.findOne({ key: key.toUpperCase(), isActive: true });

        if (!config) {
            return null;
        }

        // Decrypt if sensitive
        const configObj = config.toObject();
        if (config.isSensitive && config.value) {
            configObj.value = decryptValue(config.value);
        }

        // Cache the result
        await redisClient.setex(getCacheKey(key), CACHE_TTL, JSON.stringify(configObj));

        return configObj as IEnvConfig;
    } catch (error) {
        console.error(`❌ Error fetching config ${key}:`, error);
        return null;
    }
};

// Update single configuration
const updateConfig = async (
    key: string,
    value: string,
    adminId?: Types.ObjectId
): Promise<IEnvConfig> => {
    try {
        const config = await EnvConfig.findOne({ key: key.toUpperCase() });

        if (!config) {
            throw new Error(`Configuration ${key} not found`);
        }

        // Encrypt if sensitive
        const finalValue = config.isSensitive ? encryptValue(value) : value;

        config.value = finalValue;
        config.lastModifiedBy = adminId;
        await config.save();

        // Invalidate cache
        await invalidateCache(key);
        await invalidateCache(); // Also invalidate "ALL" cache

        console.log(`✅ Updated config: ${key} by admin ${adminId || 'SYSTEM'}`);

        return config;
    } catch (error) {
        console.error(`❌ Error updating config ${key}:`, error);
        throw error;
    }
};

// Bulk update configurations
const bulkUpdateConfigs = async (
    updates: IEnvConfigUpdate[],
    adminId?: Types.ObjectId
): Promise<void> => {
    const session = await EnvConfig.startSession();
    session.startTransaction();

    try {
        for (const update of updates) {
            const config = await EnvConfig.findOne({ key: update.key.toUpperCase() }).session(session);

            if (!config) {
                throw new Error(`Configuration ${update.key} not found`);
            }

            const finalValue = config.isSensitive ? encryptValue(update.value) : update.value;

            config.value = finalValue;
            config.lastModifiedBy = adminId;
            await config.save({ session });
        }

        await session.commitTransaction();

        // Invalidate all cache
        await invalidateCache();

        console.log(`✅ Bulk updated ${updates.length} configs by admin ${adminId || 'SYSTEM'}`);
    } catch (error) {
        await session.abortTransaction();
        console.error('❌ Bulk update failed:', error);
        throw error;
    } finally {
        session.endSession();
    }
};

// Create or update configuration
const upsertConfig = async (
    key: string,
    value: string,
    metadata?: {
        group?: string;
        type?: string;
        isSensitive?: boolean;
        requiresRestart?: boolean;
        description?: string;
    }
): Promise<IEnvConfig> => {
    try {
        const isSensitive = metadata?.isSensitive ?? SENSITIVE_FIELDS.includes(key);
        const finalValue = isSensitive ? encryptValue(value) : value;

        const config = await EnvConfig.findOneAndUpdate(
            { key: key.toUpperCase() },
            {
                key: key.toUpperCase(),
                value: finalValue,
                group: metadata?.group || 'General',
                type: metadata?.type || 'string',
                isSensitive,
                requiresRestart: metadata?.requiresRestart || false,
                description: metadata?.description || '',
                isActive: true,
            },
            { upsert: true, new: true }
        );

        await invalidateCache();

        return config;
    } catch (error) {
        console.error(`❌ Error upserting config ${key}:`, error);
        throw error;
    }
};

// Reload configurations (bypass cache)
const reloadConfigs = async (): Promise<IEnvConfigGrouped> => {
    await invalidateCache();
    return getAllConfigs();
};

export const envConfigService = {
    encryptValue,
    decryptValue,
    getAllConfigs,
    getConfigByKey,
    updateConfig,
    bulkUpdateConfigs,
    upsertConfig,
    reloadConfigs,
    invalidateCache,
};
