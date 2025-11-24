import mongoose from "mongoose";
import User from "../app/module/Auth/auth.model";
import UserProfile from "../app/module/User/user.model";
import config from "../app/config";

// Replace with your MongoDB URI if running standalone
const uri = config.database_url as string

async function syncUserProfiles() {
  try {
    // Connect to MongoDB if not already connected
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(uri); // no options needed in Mongoose 7+
      console.log("Connected to MongoDB");
    }

    // Step 1: Get all user IDs
    const users = await User.find({}, { _id: 1 }).lean();
    const userIds = users.map(u => u._id);
    console.log(`Found ${userIds.length} users.`);

    // Step 2: Delete userProfiles where 'user' does NOT match any user ID
    const deleteResult = await UserProfile.deleteMany({ user: { $nin: userIds } });
    console.log(`Deleted ${deleteResult.deletedCount} userProfiles.`);

    // Step 3: Optional - verify remaining userProfiles
    const remainingCount = await UserProfile.countDocuments();
    console.log(`Remaining userProfiles: ${remainingCount}`);
  } catch (err) {
    console.error("Error syncing userProfiles:", err);
  } finally {
    // Disconnect only if we connected in this script
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
      console.log("Disconnected from MongoDB");
    }
  }
}

// Run the script immediately
syncUserProfiles();
