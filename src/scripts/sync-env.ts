import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { envConfigService } from '../app/module/EnvConfig/envConfig.service';
import {
    ENV_CONFIG_METADATA,
    EXCLUDED_ENV_VARS,
    ENV_CONFIG_GROUPS,
    ENV_CONFIG_TYPES
} from '../app/module/EnvConfig/envConfig.constant';

// Load .env file for database connection
dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;

async function syncEnvToDatabase() {
    try {
        if (!DATABASE_URL) {
            throw new Error('DATABASE_URL is not defined in your .env file');
        }

        console.log('🔄 Connecting to MongoDB...');
        await mongoose.connect(DATABASE_URL);
        console.log('✅ Connected to MongoDB\n');

        // Read .env file directly to avoid polluting with process.env
        const envPath = path.join(process.cwd(), '.env');
        if (!fs.existsSync(envPath)) {
            throw new Error('.env file not found in current directory');
        }

        const envFileContent = fs.readFileSync(envPath, 'utf8');
        const envVars = dotenv.parse(envFileContent);

        console.log(`📋 Found ${Object.keys(envVars).length} variations in .env file.`);

        let syncedCount = 0;
        let skippedCount = 0;

        for (const [key, value] of Object.entries(envVars)) {
            // 1. Skip system/excluded variables
            const isExcluded = EXCLUDED_ENV_VARS.includes(key);
            const isDbOrRedis = key.toUpperCase().includes('DATABASE') ||
                key.toUpperCase().includes('REDIS') ||
                key.toUpperCase().includes('MONGODB');

            if (isExcluded || isDbOrRedis) {
                console.log(`⏭️  Skipping ${key} (EXCLUDED/DB/REDIS)`);
                skippedCount++;
                continue;
            }

            // 2. Skip empty values
            if (!value) {
                console.log(`⏭️  Skipping ${key} (EMPTY VALUE)`);
                skippedCount++;
                continue;
            }

            // 3. Get metadata or use default
            let metadata = ENV_CONFIG_METADATA.find(m => m.key === key);

            if (!metadata) {
                metadata = {
                    key,
                    group: ENV_CONFIG_GROUPS.GENERAL,
                    type: ENV_CONFIG_TYPES.STRING,
                    description: `Automatically synced from .env: ${key}`,
                    isSensitive: false,
                    requiresRestart: false,
                };
            }

            // 4. Upsert configuration
            await envConfigService.upsertConfig(key, value, metadata);
            console.log(`✅ Synced: ${key}`);
            syncedCount++;
        }

        console.log('\n' + '='.repeat(40));
        console.log(`✨ Sync Complete!`);
        console.log(`✅ Total Synced: ${syncedCount}`);
        console.log(`⏭️  Total Skipped: ${skippedCount}`);
        console.log('='.repeat(40));

    } catch (error) {
        console.error('\n❌ Sync Failed:', error);
    } finally {
        await mongoose.disconnect();
        console.log('👋 Disconnected from MongoDB');
        process.exit(0);
    }
}

syncEnvToDatabase();
