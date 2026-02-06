import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import httpStatus from 'http-status';
import { envConfigService } from './envConfig.service';
import { envConfigLoader } from './envConfig.loader';
import { Types } from 'mongoose';
import { EnvConfig } from './envConfig.model';

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

    // Import metadata
    const { ENV_CONFIG_METADATA, EXCLUDED_ENV_VARS } = await import('./envConfig.constant');

    // Get all env variables
    const envVars = process.env;

    for (const [key, value] of Object.entries(envVars)) {
        // Find metadata for this key
        const metadata = ENV_CONFIG_METADATA.find((m) => m.key === key);

        // ONLY sync keys that are defined in metadata
        if (!metadata) {
            skippedCount++;
            continue;
        }

        // Skip excluded variables
        if (EXCLUDED_ENV_VARS.includes(key)) {
            skippedCount++;
            continue;
        }

        // Skip empty values
        if (!value) {
            skippedCount++;
            continue;
        }

        // Check if config already exists
        const existingConfig = await envConfigService.getConfigByKey(key);

        if (existingConfig && !force) {
            skippedCount++;
            continue;
        }

        // Upsert configuration
        await envConfigService.upsertConfig(key, value, metadata);
        syncedCount++;
    }

    // Delete keys from DB that are not in metadata
    const allDbKeys = await EnvConfig.find({}, 'key');
    let deletedCount = 0;

    for (const config of allDbKeys) {
        if (!ENV_CONFIG_METADATA.find(m => m.key === config.key)) {
            await EnvConfig.deleteOne({ key: config.key });
            deletedCount++;
        }
    }

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: `Sync complete: ${syncedCount} updated/added, ${deletedCount} unmapped removed, ${skippedCount} skipped.`,
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
