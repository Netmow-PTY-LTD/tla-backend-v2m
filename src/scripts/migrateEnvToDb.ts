import dotenv from 'dotenv';
import path from 'path';
import mongoose from 'mongoose';
import { envConfigService } from '../app/module/EnvConfig/envConfig.service';
import { ENV_CONFIG_METADATA, EXCLUDED_ENV_VARS } from '../app/module/EnvConfig/envConfig.constant';

dotenv.config({ path: path.join(process.cwd(), '.env') });

const DATABASE_URL = process.env.DATABASE_URL;

async function migrateEnvToDb() {
    try {
        console.log('🚀 Starting .env to Database migration...\n');

        // Connect to database
        if (!DATABASE_URL) {
            throw new Error('DATABASE_URL not found in .env file');
        }

        await mongoose.connect(DATABASE_URL);
        console.log('✅ Connected to database\n');

        let migratedCount = 0;
        let skippedCount = 0;
        let errorCount = 0;

        // Get all environment variables
        const envVars = process.env;

        console.log(`📋 Found ${Object.keys(envVars).length} environment variables\n`);
        console.log('🔍 Processing...\n');

        for (const [key, value] of Object.entries(envVars)) {
            // Skip excluded variables
            if (EXCLUDED_ENV_VARS.includes(key)) {
                console.log(`⏭️  Skipping ${key} (excluded - must stay in .env)`);
                skippedCount++;
                continue;
            }

            // Skip empty values
            if (!value || value.trim() === '') {
                console.log(`⏭️  Skipping ${key} (empty value)`);
                skippedCount++;
                continue;
            }

            // Skip internal Node variables
            if (key.startsWith('npm_') || key.startsWith('INIT_CWD')) {
                skippedCount++;
                continue;
            }

            try {
                // Find metadata for this key
                const metadata = ENV_CONFIG_METADATA.find((m) => m.key === key);

                if (!metadata) {
                    console.log(`⚠️  No metadata for ${key}, using defaults`);
                }

                // Upsert configuration
                await envConfigService.upsertConfig(key, value, metadata);

                console.log(`✅ Migrated: ${key}${metadata?.isSensitive ? ' (encrypted)' : ''}`);
                migratedCount++;
            } catch (error) {
                console.error(`❌ Error migrating ${key}:`, error);
                errorCount++;
            }
        }

        console.log('\n' + '='.repeat(50));
        console.log('📊 Migration Summary:');
        console.log('='.repeat(50));
        console.log(`✅ Successfully migrated: ${migratedCount}`);
        console.log(`⏭️  Skipped: ${skippedCount}`);
        console.log(`❌ Errors: ${errorCount}`);
        console.log('='.repeat(50) + '\n');

        if (errorCount === 0) {
            console.log('🎉 Migration completed successfully!');
        } else {
            console.log('⚠️  Migration completed with errors. Please review the logs.');
        }
    } catch (error) {
        console.error('\n❌ Migration failed:', error);
        process.exit(1);
    } finally {
        await mongoose.disconnect();
        console.log('\n✅ Disconnected from database');
        process.exit(0);
    }
}

// Run migration
migrateEnvToDb();
