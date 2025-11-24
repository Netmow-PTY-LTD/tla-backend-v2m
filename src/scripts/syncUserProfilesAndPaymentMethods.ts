import mongoose from "mongoose";
import UserProfile from "../app/module/User/user.model";

import config from "../app/config";
import PaymentMethod from "../app/module/CreditPayment/paymentMethod.model";

const uri = config.database_url as string;

async function syncUserProfilesAndPaymentMethods() {
  try {
    // Connect if not connected
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(uri);
      console.log("Connected to MongoDB");
    }

   

    // Get all valid UserProfile IDs
    const profiles = await UserProfile.find({}, { _id: 1 }).lean();
    const userProfileIds = profiles.map(p => p._id);

    console.log(`Found ${userProfileIds.length} valid userProfiles.`);

    // Delete paymentMethods where userProfileId is NOT valid
    const deletePaymentMethodResult = await PaymentMethod.deleteMany({
      userProfileId: { $nin: userProfileIds },
    });

    console.log(`Deleted ${deletePaymentMethodResult.deletedCount} invalid paymentMethods.`);

    const remainingPaymentMethods = await PaymentMethod.countDocuments();
    console.log(`Remaining paymentMethods: ${remainingPaymentMethods}`);

  } catch (err) {
    console.error("Error during sync:", err);
  } finally {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
      console.log("Disconnected from MongoDB");
    }
  }
}

syncUserProfilesAndPaymentMethods();
