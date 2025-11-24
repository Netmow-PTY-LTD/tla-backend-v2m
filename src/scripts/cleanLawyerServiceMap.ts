import mongoose from "mongoose";
import UserProfile from "../app/module/User/user.model";         // your UserProfile model

import config from "../app/config";
import { LawyerServiceMap } from "../app/module/User/lawyerServiceMap.model";

const uri = config.database_url as string;

async function cleanLawyerServiceMaps() {
  try {
    // Connect to MongoDB if not already connected
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(uri); // no options needed in Mongoose 7+
      console.log("Connected to MongoDB");
    }

    // Step 1: Get all valid userProfile IDs
    const userProfiles = await UserProfile.find({}, { _id: 1 }).lean();
    const userProfileIds = userProfiles.map(u => u._id.toString());
    console.log(`Found ${userProfileIds.length} userProfiles.`);

    // Step 2: Delete lawyerServiceMaps where userProfile does NOT exist
    const deleteResult = await LawyerServiceMap.deleteMany({
      userProfile: { $nin: userProfileIds }
    });
    console.log(`Deleted ${deleteResult.deletedCount} lawyerServiceMaps without valid userProfile.`);

    // Step 3: Optional - verify remaining lawyerServiceMaps
    const remainingCount = await LawyerServiceMap.countDocuments();
    console.log(`Remaining lawyerServiceMaps: ${remainingCount}`);
  } catch (err) {
    console.error("Error cleaning lawyerServiceMaps:", err);
  } finally {
    // Disconnect only if we connected in this script
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
      console.log("Disconnected from MongoDB");
    }
  }
}

// Run the script
cleanLawyerServiceMaps();
