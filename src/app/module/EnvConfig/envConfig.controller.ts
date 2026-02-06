import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import httpStatus from 'http-status';
import { envConfigService } from './envConfig.service';
import { envConfigLoader } from './envConfig.loader';
import { Types } from 'mongoose';
import { EnvConfig } from './envConfig.model';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import {
    ENV_CONFIG_METADATA,
    EXCLUDED_ENV_VARS,
    ENV_CONFIG_GROUPS,
    ENV_CONFIG_TYPES
} from './envConfig.constant';
import { IEnvConfigMetadata } from './envConfig.interface';

// Get all configurations
const getAllConfigs = catchAsync(async (req: Request, res: Response) => {
    const result = await envConfigService.getAllConfigs();

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Environment configurations retrieved successfully',
        data: result,
    });
});

// Get single configuration by key
const getConfigByKey = catchAsync(async (req: Request, res: Response) => {
    const { key } = req.params;

    const result = await envConfigService.getConfigByKey(key);

    if (!result) {
        sendResponse(res, {
            statusCode: httpStatus.NOT_FOUND,
            success: false,
            message: `Configuration ${key} not found`,
            data: null,
        });
        return;
    }

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Configuration retrieved successfully',
        data: result,
    });
});

// Update single configuration
const updateConfig = catchAsync(async (req: Request, res: Response) => {
    const { key } = req.params;
    const { value, group, type, isSensitive, requiresRestart, description } = req.body;
    const adminId = req.user?.userId;

    const metadata = {
        group,
        type,
        isSensitive,
        requiresRestart,
        description,
    };

    const result = await envConfigService.updateConfig(
        key,
        value,
        adminId ? new Types.ObjectId(adminId) : undefined,
        metadata
    );

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: `Configuration ${key} updated successfully${result.requiresRestart ? '. Application restart required for changes to take effect.' : ''
            }`,
        data: result,
    });
});

// Bulk update configurations
const bulkUpdateConfigs = catchAsync(async (req: Request, res: Response) => {
    const { configs } = req.body;
    const adminId = req.user?.userId;

    await envConfigService.bulkUpdateConfigs(
        configs,
        adminId ? new Types.ObjectId(adminId) : undefined
    );

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: `${configs.length} configurations updated successfully`,
        data: null,
    });
});

// Sync from .env file
const syncFromEnv = catchAsync(async (req: Request, res: Response) => {
    const { force } = req.body || {};

    let syncedCount = 0;
    let skippedCount = 0;

    // 4. Get metadata or use default

    // Read .env file directly to get only project-specific variables
    const envFilePath = path.join(process.cwd(), '.env');
    let envVars: Record<string, string> = {};

    if (fs.existsSync(envFilePath)) {
        const envFileContent = fs.readFileSync(envFilePath, 'utf-8');
        envVars = dotenv.parse(envFileContent);
    } else {
        // Fallback to process.env if .env file is missing (though less precise)
        envVars = process.env as Record<string, string>;
    }

    const envKeys = Object.keys(envVars);

    for (const [key, value] of Object.entries(envVars)) {
        // 1. Skip excluded variables
        const isExcluded = EXCLUDED_ENV_VARS.includes(key);
        const isDbOrRedis = key.toUpperCase().includes('DATABASE') ||
            key.toUpperCase().includes('REDIS') ||
            key.toUpperCase().includes('MONGODB');

        if (isExcluded || isDbOrRedis) {
            skippedCount++;
            continue;
        }

        // 2. Skip empty values
        if (!value) {
            skippedCount++;
            continue;
        }

        // 3. Get metadata or use default
        let metadata: IEnvConfigMetadata | undefined = ENV_CONFIG_METADATA.find((m) => m.key === key);

        if (!metadata) {
            metadata = {
                key,
                group: ENV_CONFIG_GROUPS.GENERAL,
                type: ENV_CONFIG_TYPES.STRING,
                description: `Automatically synced from project environment: ${key}`,
                isSensitive: false,
                requiresRestart: false,
            };
        }

        // 4. Check if config already exists
        const existingConfig = await EnvConfig.findOne({ key: key.toUpperCase() });

        if (existingConfig && !force) {
            skippedCount++;
            continue;
        }

        // 5. Upsert configuration
        await envConfigService.upsertConfig(key, value, metadata);
        syncedCount++;
    }

    // Cleanup: Delete keys from DB that are not in metadata AND not in current .env
    const allDbConfigs = await EnvConfig.find({}, 'key');
    let deletedCount = 0;

    for (const config of allDbConfigs) {
        const inMetadata = ENV_CONFIG_METADATA.some(m => m.key === config.key);
        const inEnvFile = envKeys.includes(config.key);
        const isExcluded = EXCLUDED_ENV_VARS.includes(config.key) ||
            config.key.toUpperCase().includes('DATABASE') ||
            config.key.toUpperCase().includes('REDIS') ||
            config.key.toUpperCase().includes('MONGODB');

        // If it's excluded, OR not in metadata AND not in .env file, remove it
        if (isExcluded || (!inMetadata && !inEnvFile)) {
            await EnvConfig.deleteOne({ key: config.key });
            deletedCount++;
        }
    }

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: `Sync complete: ${syncedCount} updated/added, ${deletedCount} removed, ${skippedCount} skipped (includes DB/Redis/Excluded).`,
        data: { synced: syncedCount, deleted: deletedCount, skipped: skippedCount },
    });
});

// Export to .env format
const exportToEnv = catchAsync(async (req: Request, res: Response) => {
    const configs = await envConfigService.getAllConfigs();

    let envContent = '# Environment Configuration Export\n';
    envContent += `# Generated at: ${new Date().toISOString()}\n`;
    envContent += '# ==============================\n\n';

    for (const [group, items] of Object.entries(configs)) {
        envContent += `# ${group}\n`;
        envContent += '# ==============================\n';

        for (const item of items) {
            // Fetch actual value (decrypted)
            const fullConfig = await envConfigService.getConfigByKey(item.key);
            if (fullConfig) {
                envContent += `${item.key}=${fullConfig.value}\n`;
            }
        }

        envContent += '\n';
    }

    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Content-Disposition', 'attachment; filename=".env.export"');
    res.status(httpStatus.OK).send(envContent);
});

// Reload configurations
const reloadConfigs = catchAsync(async (req: Request, res: Response) => {
    await envConfigLoader.reload();

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Configurations reloaded successfully',
        data: null,
    });
});

export const envConfigController = {
    getAllConfigs,
    getConfigByKey,
    updateConfig,
    bulkUpdateConfigs,
    syncFromEnv,
    exportToEnv,
    reloadConfigs,
};
