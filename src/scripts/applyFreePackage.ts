import mongoose from 'mongoose';
import CreditPackage from '../app/module/CreditPayment/creditPackage.model';
import UserProfile from '../app/module/User/user.model';
import Transaction from '../app/module/CreditPayment/transaction.model';
import User from '../app/module/Auth/auth.model'; // User schema
import { deleteCache } from '../app/utils/cacheManger';
import { CacheKeys } from '../app/config/cacheKeys';
import config from '../app/config';

const FREE_PACKAGE_ID = '690c3da8ce96eb30910240e3';

async function applyFreePackageToLawyers() {
  try {
    // Connect to MongoDB
    await mongoose.connect(config.database_url as string);
    console.log('Connected to MongoDB');

    // 1. Fetch the free credit package
    const freePackage = await CreditPackage.findById(FREE_PACKAGE_ID);
    if (!freePackage) {
      console.error('Free package not found');
      process.exit(1);
    }

    // 2. Fetch all user profiles
    const profiles = await UserProfile.find();

    for (const profile of profiles) {
      // 3. Fetch the user separately
      const user = await User.findById(profile.user);
      if (!user || user.regUserType !== 'lawyer') continue;

      // 4. Skip if already received package
      const alreadyAdded = await Transaction.findOne({
        userId: user._id,
        creditPackageId: freePackage._id,
      });
      if (alreadyAdded) continue;

      // 5. Update user's credits
      profile.credits += freePackage.credit;
      await profile.save();

      // 6. Create transaction
      const transaction = await Transaction.create({
        userId: user._id,
        type: 'purchase',
        creditPackageId: freePackage._id,
        credit: freePackage.credit,
        amountPaid: 0,
        currency: 'usd',
        status: 'completed',
        stripePaymentIntentId: null,
        couponCode: null,
        discountApplied: 0,
      });

      // 7. Revalidate Redis cache
      await deleteCache(CacheKeys.USER_INFO(user._id as any));

      console.log(`Added free credits for lawyer user ${user._id} - transaction ${transaction._id}`);
    }

    console.log('All lawyers processed successfully');
    process.exit(0);

  } catch (err) {
    console.error('Error applying free package:', err);
    process.exit(1);
  }
}

applyFreePackageToLawyers();
