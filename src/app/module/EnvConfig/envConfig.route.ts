import express from 'express';
import { envConfigController } from './envConfig.controller';
import { envConfigValidation } from './envConfig.validation';
import validateRequest from '../../middlewares/validateRequest';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../../constant';


const router = express.Router();

// All routes require super admin authentication
const requireSuperAdmin = auth(USER_ROLE.SUPER_ADMIN, USER_ROLE.ADMIN);

// Get all configurations grouped by category
router.get('/', requireSuperAdmin, envConfigController.getAllConfigs);

// Get single configuration by key
router.get('/:key', requireSuperAdmin, envConfigController.getConfigByKey);

// Create new configuration
router.post(
    '/',
    requireSuperAdmin,
    validateRequest(envConfigValidation.createConfigSchema),
    envConfigController.createConfig
);

// Update single configuration
router.put(
    '/:key',
    requireSuperAdmin,
    validateRequest(envConfigValidation.updateConfigSchema),
    envConfigController.updateConfig
);

// Delete configuration
router.delete('/:key', requireSuperAdmin, envConfigController.deleteConfig);

// Bulk update configurations
router.put(
    '/bulk/update',
    requireSuperAdmin,
    validateRequest(envConfigValidation.bulkUpdateConfigSchema),
    envConfigController.bulkUpdateConfigs
);

// Sync configurations from .env file
router.post(
    '/sync/from-env',
    requireSuperAdmin,
    validateRequest(envConfigValidation.syncFromEnvSchema),
    envConfigController.syncFromEnv
);

// Export configurations to .env format
router.post('/export/to-env', requireSuperAdmin, envConfigController.exportToEnv);

// Reload configurations from database
router.post('/reload', requireSuperAdmin, envConfigController.reloadConfigs);

export const envConfigRoutes = router;
