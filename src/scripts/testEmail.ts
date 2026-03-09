import mongoose from "mongoose";

import { sendEmail } from "../app/emails/email.service";
import { AppSettings } from "../app/module/Settings/settings.model";
import config from "../app/config";

/**
 * Script for testing the email sending system.
 * 
 * Usage:
 *   npx ts-node src/scripts/testEmail.ts <your-email@example.com> <template-key-optional>
 * 
 * Example:
 *   npx ts-node src/scripts/testEmail.ts user@example.com welcome_to_client
 */

const uri = config.database_url as string;

async function runTest() {
    // Get arguments from command line: [0] = node, [1] = script, [2] = email, [3] = template
    const args = process.argv.slice(2);

    // Default values
    const targetEmailsRaw = args[0] || 'rabby.netmow@gmail.com,tuhin.netmow@gmail.com';
    const requestedTemplate = args[1] || 'welcome_to_lawyer';

    // Parse emails (support comma-separated string)
    const targetEmail = targetEmailsRaw.split(',').map(e => e.trim()).filter(e => e.length > 0);

    if (targetEmail.length === 0) {
        console.log("\n❌ Error: Please provide a recipient email address.");
        console.log("Usage: yarn test:email <email> [templateKey]");
        console.log("Example: yarn test:email user@example.com welcome_to_client");
        console.log("\nAvailable Hardcoded Templates (Fallbacks):");
        console.log("- welcome_to_client");
        console.log("- welcome_to_lawyer");
        console.log("- otp_email");
        console.log("- verify_email");
        console.log("- password_reset");
        console.log("- contact");
        process.exit(1);
    }

    try {
        console.log("\n🔗 Connecting to Database...");
        if (mongoose.connection.readyState === 0) {
            await mongoose.connect(uri);
            console.log("✅ Connected to MongoDB");
        }

        // 1. Ensure email is enabled in settings
        console.log("⚙️ Checking Email Provider Settings...");
        const settings = await AppSettings.findOne();
        if (settings && !settings.emailProviderEnabled) {
            console.log("⚠️ Email provider was disabled in AppSettings. Temporarily enabling for test...");
            await AppSettings.updateOne({}, { emailProviderEnabled: true });
        } else if (!settings) {
            console.log("⚠️ No AppSettings found. Creating a temporary configuration...");
            await AppSettings.create({
                emailProviderEnabled: true,
                siteName: "The Law App Test"
            });
        } else {
            console.log("✅ Email Provider is enabled.");
        }

        console.log(`\n🚀 Sending test email(s)...`);
        console.log(`   To: ${targetEmail.join(', ')}`);
        console.log(`   Template: ${requestedTemplate}`);


        const practiceArea = ['Family Law', 'Criminal Law', 'Corporate Law'];


        // 3. Trigger sendEmail service
        const results = await Promise.all(targetEmail.map(email =>
            sendEmail({
                to: email,
                subject: `Test System Email - ${requestedTemplate}`,
                data: {
                    name: "Test Lawyer",
                    practiceArea: practiceArea
                },
                emailTemplate: requestedTemplate
            })
        ));

        console.log("\n✨ SUCCESS!");
        console.log("------------------------------------------");
        results.forEach((result, index) => {
            console.log(`Email [${index + 1}] (${targetEmail[index]}):`);
            console.log("   Message ID:", result?.messageId || "N/A");
            console.log("   Response:", result?.response || "OK");
        });
        console.log("------------------------------------------");

    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error("\n❌ TEST FAILED:");
        console.error("Error Message:", errorMessage);

        if (errorMessage.includes("ECONNREFUSED")) {
            console.error("💡 Tip: Check if your MongoDB is running or if the DATABASE_URL is correct.");
        }
        if (errorMessage.includes("Mailgun")) {
            console.error("💡 Tip: Check your Mailgun SMTP credentials in the .env file.");
        }
    } finally {
        if (mongoose.connection.readyState !== 0) {
            await mongoose.disconnect();
            console.log("\n🔌 Database connection closed.");
        }
    }
}

runTest();