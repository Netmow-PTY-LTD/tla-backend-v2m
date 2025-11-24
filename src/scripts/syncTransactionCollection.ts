import mongoose from "mongoose";
import User from "../app/module/Auth/auth.model";

import config from "../app/config";
import Transaction from "../app/module/CreditPayment/transaction.model";

const uri = config.database_url as string;

async function syncTransactionCollection() {
  try {
    // Connect
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(uri);
      console.log("Connected to MongoDB");
    }

    // Step 1: Get all valid user IDs
    const users = await User.find({}, { _id: 1 }).lean();
    const userIds = users.map(u => u._id);

    console.log(`Found ${userIds.length} valid users.`);

    // Step 2: Delete transaction docs where user does NOT exist
    const deleteResult = await Transaction.deleteMany({
      userId: { $nin: userIds }
    });

    console.log(`Deleted ${deleteResult.deletedCount} invalid transactions.`);

    // Step 3: Optional: Verify
    const remaining = await Transaction.countDocuments();
    console.log(`Remaining transactions: ${remaining}`);

  } catch (err) {
    console.error("Error syncing transactions:", err);
  } finally {
    // Disconnect
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
      console.log("Disconnected from MongoDB");
    }
  }
}

syncTransactionCollection();
