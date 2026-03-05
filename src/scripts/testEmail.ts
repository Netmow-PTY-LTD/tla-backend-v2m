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
    const targetEmail = ['rabby.netmow@gmail.com', 'tuhin.netmow@gmail.com'];
    const requestedTemplate = 'welcome_to_lawyer';

    if (!targetEmail) {
        console.log("\n❌ Error: Please provide a recipient email address.");
        console.log("Usage: npx ts-node src/scripts/testEmail.ts <email> [templateKey]");
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

        console.log(`\n🚀 Sending test email...`);
        console.log(`   To: ${targetEmail}`);
        console.log(`   Template: ${requestedTemplate}`);


        // 3. Trigger sendEmail service
        const result = await sendEmail({
            to: targetEmail[0],
            subject: `Test System Email - ${requestedTemplate}`,
            emailTemplate: requestedTemplate
        });

        console.log("\n✨ SUCCESS!");
        console.log("------------------------------------------");
        console.log("Message ID:", result?.messageId || "N/A");
        console.log("Response:", result?.response || "OK");
        console.log("------------------------------------------");

    } catch (error: any) {
        console.error("\n❌ TEST FAILED:");
        console.error("Error Message:", error.message || error);

        if (error.message.includes("ECONNREFUSED")) {
            console.error("💡 Tip: Check if your MongoDB is running or if the DATABASE_URL is correct.");
        }
        if (error.message.includes("Mailgun")) {
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