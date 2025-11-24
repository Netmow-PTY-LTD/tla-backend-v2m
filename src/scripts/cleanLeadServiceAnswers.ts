import mongoose from "mongoose";

import config from "../app/config";
import Lead from "../app/module/Lead/lead.model";
import { LeadServiceAnswer } from "../app/module/Lead/leadServiceAnswer.model";


const uri = config.database_url as string;

async function cleanLeadServiceAnswers() {
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

    // Step 2: Find LeadServiceAnswers that do NOT belong to any existing lead
    const leadServiceAnswers = await LeadServiceAnswer.find({}, { _id: 1, leadId: 1 }).lean();
    const answersToDelete = leadServiceAnswers
      .filter(a => !leadIds.has(a.leadId.toString()))
      .map(a => a._id);

    console.log(`LeadServiceAnswers to delete: ${answersToDelete.length}`);

    // Step 3: Delete those LeadServiceAnswers
    if (answersToDelete.length > 0) {
      const deleteResult = await LeadServiceAnswer.deleteMany({ _id: { $in: answersToDelete } });
      console.log(`Deleted ${deleteResult.deletedCount} LeadServiceAnswers.`);
    } else {
      console.log("No LeadServiceAnswers to delete.");
    }

    // Optional: remaining LeadServiceAnswers count
    const remainingCount = await LeadServiceAnswer.countDocuments();
    console.log(`Remaining LeadServiceAnswers: ${remainingCount}`);
  } catch (err) {
    console.error("Error cleaning LeadServiceAnswers:", err);
  } finally {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
      console.log("Disconnected from MongoDB");
    }
  }
}

// Run the script
cleanLeadServiceAnswers();
