import mongoose from "mongoose";

import config from "../app/config";
import Lead from "../app/module/Lead/lead.model";
import LeadResponse from "../app/module/LeadResponse/response.model";

const uri = config.database_url as string;

async function cleanLeadResponses() {
  try {
    // Connect if not already connected
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(uri);
      console.log("Connected to MongoDB");
    }

    // Step 1: Get all lead IDs
    const leads = await Lead.find({}, { _id: 1 }).lean();
    const leadIds = new Set(leads.map(l => l._id.toString()));
    console.log(`Total leads found: ${leadIds.size}`);

    // Step 2: Find leadResponses that do NOT belong to any existing lead
    const leadResponses = await LeadResponse.find({}, { _id: 1, leadId: 1 }).lean();
    const responsesToDelete = leadResponses
      .filter(r => !leadIds.has(r.leadId.toString()))
      .map(r => r._id);

    console.log(`LeadResponses to delete: ${responsesToDelete.length}`);

    // Step 3: Delete those leadResponses
    if (responsesToDelete.length > 0) {
      const deleteResult = await LeadResponse.deleteMany({ _id: { $in: responsesToDelete } });
      console.log(`Deleted ${deleteResult.deletedCount} leadResponses.`);
    } else {
      console.log("No leadResponses to delete.");
    }

    // Optional: remaining leadResponses count
    const remainingCount = await LeadResponse.countDocuments();
    console.log(`Remaining leadResponses: ${remainingCount}`);
  } catch (err) {
    console.error("Error cleaning leadResponses:", err);
  } finally {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
      console.log("Disconnected from MongoDB");
    }
  }
}

// Run the script
cleanLeadResponses();
