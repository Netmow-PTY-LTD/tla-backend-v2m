/* eslint-disable @typescript-eslint/no-explicit-any */
import mongoose from 'mongoose';
import { getCurrentEnvironment } from '../app/config/stripe.config';

// This script helps migrate user data from test to live environment
// Run this when switching from test to live for existing users

const migrateUserStripeDataToLive = async () => {
  try {
    console.log(`Current environment: ${getCurrentEnvironment()}`);

    if (getCurrentEnvironment() === 'test') {
      console.log('❌ Cannot run user migration in test mode. Set NODE_ENV=production');
      return;
    }

    // Connect to database
    await mongoose.connect(process.env.DATABASE_URL!);

    const UserProfile = mongoose.model('UserProfile',
      new mongoose.Schema({
        user: mongoose.Types.ObjectId,
        credits: Number,
        subscriptionId: mongoose.Types.ObjectId,
        eliteProSubscriptionId: mongoose.Types.ObjectId,
        isElitePro: Boolean,
        stripeTestModeMigrated: { type: Boolean, default: false }, // Track if user data was migrated
      })
    );

    const PaymentMethod = mongoose.model('PaymentMethod',
      new mongoose.Schema({
        userProfileId: mongoose.Types.ObjectId,
        stripeCustomerId: String,
        paymentMethodId: String,
        stripeEnvironment: String,
        isActive: { type: Boolean, default: true },
      })
    );

    const UserSubscription = mongoose.model('UserSubscription',
      new mongoose.Schema({
        userId: mongoose.Types.ObjectId,
        stripeSubscriptionId: String,
        stripeEnvironment: String,
        status: String,
      })
    );

    const EliteProUserSubscription = mongoose.model('EliteProUserSubscription',
      new mongoose.Schema({
        userId: mongoose.Types.ObjectId,
        stripeSubscriptionId: String,
        stripeEnvironment: String,
        status: String,
      })
    );

    // Find users who have test mode data but haven't been migrated
    const usersWithTestData = await UserProfile.find({
      stripeTestModeMigrated: { $ne: true },
    }).populate('user');

    console.log(`Found ${usersWithTestData.length} users with potential test data to migrate`);

    for (const userProfile of usersWithTestData) {
      try {
        console.log(`Processing user: ${userProfile._id}`);

        // Check if user has test mode payment methods
        const testPaymentMethods = await PaymentMethod.find({
          userProfileId: userProfile._id,
          stripeEnvironment: 'test',
          isActive: true,
        });

        // Check if user has test mode subscriptions
        const testSubscriptions = await UserSubscription.find({
          userId: userProfile.user,
          stripeEnvironment: 'test',
          status: { $in: ['active', 'trialing'] },
        });

        const testEliteProSubscriptions = await EliteProUserSubscription.find({
          userId: userProfile.user,
          stripeEnvironment: 'test',
          status: { $in: ['active', 'trialing'] },
        });

        const hasTestData = testPaymentMethods.length > 0 ||
                           testSubscriptions.length > 0 ||
                           testEliteProSubscriptions.length > 0;

        if (hasTestData) {
          console.log(`  📋 User has test data:`);
          console.log(`    - Payment methods: ${testPaymentMethods.length}`);
          console.log(`    - Subscriptions: ${testSubscriptions.length}`);
          console.log(`    - Elite Pro subscriptions: ${testEliteProSubscriptions.length}`);

          // Mark user as needing migration (don't auto-migrate, let them do it manually)
          await UserProfile.findByIdAndUpdate(userProfile._id, {
            stripeTestModeMigrated: false, // Explicitly set to false to indicate needs migration
          });

          console.log(`  ✅ Marked user for manual migration`);
        } else {
          // No test data found, mark as migrated
          await UserProfile.findByIdAndUpdate(userProfile._id, {
            stripeTestModeMigrated: true,
          });
          console.log(`  ⏭️  No test data found, marked as migrated`);
        }

      } catch (error) {
        console.error(`❌ Failed to process user ${userProfile._id}:`, error);
      }
    }

    console.log('🎯 Migration check completed!');
    console.log('\n📋 NEXT STEPS:');
    console.log('1. Users with test data need to re-add payment methods in live mode');
    console.log('2. Users need to recreate subscriptions in live mode');
    console.log('3. Consider offering migration incentives or automated migration');

    process.exit(0);

  } catch (error) {
    console.error('Migration check failed:', error);
    process.exit(1);
  }
};

// Run migration check if this script is executed directly
if (require.main === module) {
  migrateUserStripeDataToLive();
}

export { migrateUserStripeDataToLive };