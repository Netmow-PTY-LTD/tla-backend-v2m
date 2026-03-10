/* eslint-disable @typescript-eslint/no-explicit-any */
import mongoose from 'mongoose';
import Stripe from 'stripe';
import config from '../app/config';
import { stripe as liveStripe, getCurrentEnvironment } from '../app/config/stripe.config';

// This script helps migrate Stripe products from test to live environment
// Run this only when switching from test to live for the first time

const migrateStripeProductsToLive = async () => {
  try {
    console.log(`Current environment: ${getCurrentEnvironment()}`);

    if (getCurrentEnvironment() === 'test') {
      console.log('❌ Cannot run migration in test mode. Set NODE_ENV=production');
      return;
    }

    // Connect to database
    await mongoose.connect(config.database_url!);

    // Get all subscription packages that have Stripe IDs
    const SubscriptionPackage = mongoose.model('SubscriptionPackage',
      new mongoose.Schema({
        name: String,
        description: String,
        stripeProductId: String,
        stripePriceId: String,
        price: {
          amount: Number,
          currency: String
        },
        billingCycle: String,
        country: mongoose.Types.ObjectId
      })
    );

    const EliteProPackage = mongoose.model('EliteProPackage',
      new mongoose.Schema({
        name: String,
        description: String,
        stripeProductId: String,
        stripePriceId: String,
        price: {
          amount: Number,
          currency: String
        },
        billingCycle: String
      })
    );

    // Migrate Subscription Packages
    const subscriptions = await SubscriptionPackage.find({
      stripeProductId: { $exists: true }
    });

    console.log(`Found ${subscriptions.length} subscription packages to migrate`);

    for (const sub of subscriptions) {
      try {
        // Create product in live mode
        const liveProduct = await liveStripe.products.create({
          name: sub.name || 'Unnamed Product',
          description: sub.description || `${sub.name || 'Product'} subscription plan`,
        });

        // Create price in live mode
        const intervalMap: any = {
          weekly: 'week',
          monthly: 'month',
          yearly: 'year',
        };

        const livePrice = await liveStripe.prices.create({
          product: liveProduct.id,
          unit_amount: (sub.price?.amount || 0) * 100,
          currency: (sub.price?.currency || 'usd').toLowerCase(),
          recurring: sub.billingCycle ? { interval: intervalMap[sub.billingCycle] } : undefined,
          tax_behavior: 'exclusive',
        });

        // Update database with live IDs
        await SubscriptionPackage.findByIdAndUpdate(sub._id, {
          stripeProductId_live: liveProduct.id,
          stripePriceId_live: livePrice.id,
        });

        console.log(`✅ Migrated: ${sub.name} (${liveProduct.id})`);
      } catch (error) {
        console.error(`❌ Failed to migrate ${sub.name}:`, error);
      }
    }

    // Migrate Elite Pro Packages
    const elitePackages = await EliteProPackage.find({
      stripeProductId: { $exists: true }
    });

    console.log(`Found ${elitePackages.length} elite pro packages to migrate`);

    for (const pkg of elitePackages) {
      try {
        const liveProduct = await liveStripe.products.create({
          name: pkg.name || 'Unnamed Elite Pro Package',
          description: pkg.description || `${pkg.name || 'Package'} elite pro plan`,
        });

        const livePrice = await liveStripe.prices.create({
          product: liveProduct.id,
          unit_amount: (pkg.price?.amount || 0) * 100,
          currency: (pkg.price?.currency || 'usd').toLowerCase(),
          recurring: pkg.billingCycle ? { interval: 'month' } : undefined,
          tax_behavior: 'exclusive',
        });

        await EliteProPackage.findByIdAndUpdate(pkg._id, {
          stripeProductId_live: liveProduct.id,
          stripePriceId_live: livePrice.id,
        });

        console.log(`✅ Migrated: ${pkg.name} (${liveProduct.id})`);
      } catch (error) {
        console.error(`❌ Failed to migrate ${pkg.name}:`, error);
      }
    }

    console.log('🎉 Migration completed!');
    process.exit(0);

  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

// Run migration if this script is executed directly
if (require.main === module) {
  migrateStripeProductsToLive();
}

export { migrateStripeProductsToLive };