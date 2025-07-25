// import mongoose from "mongoose";
// import UserProfile from "../app/module/User/models/user.model"; // adjust the path
// import Lead from "../app/module/Lead/models/lead.model";
// import LeadServiceAnswer from "../app/module/Lead/models/leadServiceAnswer.model";
// import CountryWiseServiceWiseField from "../app/module/CountryWiseMap/models/countryWiseServiceWiseFields.model";

// const MONGODB_URI = "mongodb+srv://tla-db:ucTzNJuV5jmerx2U@rh-dev.enoq8.mongodb.net/tlaDB?retryWrites=true&w=majority&appName=rh-dev"; 

// // --- Payload data ---
// const payload = {
//   countryId: "682ecd01e6b730f229c8d3d3",
//   serviceId: "682ecfbae3ebe5d62bf3c9ae",
//   leadPriority: "within_a_week",
//   additionalDetails: "I need this service too urgently.",
//   budgetAmount: "264",
//   locationId: "682ece8ae3ebe5d62bf3c989",
//   questions: [
//     {
//       step: 1,
//       questionId: "6853b5385ef7ac305b46658a",
//       question: "What type of administrative law issue do you need help with?",
//       order: 1,
//       checkedOptionsDetails: [
//         { id: "6853d40e6cc9c59ece30fc2a", name: "Visa Application", is_checked: true, idExtraData: "" },
//         { id: "6853d40e6cc9c59ece30fc2b", name: "Citizenship", is_checked: false, idExtraData: "" },
//       ],
//     },
//     {
//       step: 2,
//       questionId: "6853b5475ef7ac305b46658d",
//       question: "Which authority or government department is involved?",
//       order: 2,
//       checkedOptionsDetails: [
//         { id: "6853d40e6cc9c59ece30fc2d", name: "Home Affairs / Immigration", is_checked: true, idExtraData: "" },
//       ],
//     },
//     {
//       step: 3,
//       questionId: "6853b5515ef7ac305b466590",
//       question: "What stage is your matter currently at?",
//       order: 3,
//       checkedOptionsDetails: [
//         { id: "6853d40e6cc9c59ece30fc2e", name: "Initial Stage", is_checked: true, idExtraData: "" },
//       ],
//     },
//     {
//       step: 4,
//       questionId: "6853b55a5ef7ac305b466593",
//       question: "How would you like the service to be delivered?",
//       order: 4,
//       checkedOptionsDetails: [
//         { id: "6853d40e6cc9c59ece30fc2f", name: "Online", is_checked: true, idExtraData: "" },
//       ],
//     },
//     {
//       step: 5,
//       questionId: "6853d3766cc9c59ece30fc08",
//       question: "When are you looking to get started?",
//       order: 5,
//       checkedOptionsDetails: [
//         { id: "6853d40e6cc9c59ece30fc30", name: "Within a week", is_checked: true, idExtraData: "" },
//       ],
//     },
//   ],
// };

// const userId = "6881ef9e79930dd9530bcb73"; // Replace with a valid User ID
// const totalCount = 500;

// const CreateBulkLeads = async () => {
//   await mongoose.connect(MONGODB_URI);
//   const session = await mongoose.startSession();

//   try {
//     session.startTransaction();

//     const userProfile = await UserProfile.findOne({ user: userId })
//       .select("_id")
//       .session(session);

//     if (!userProfile) {
//       throw new Error("User profile not found");
//     }

//     const creditInfo = await CountryWiseServiceWiseField.findOne({
//       countryId: payload.countryId,
//       serviceId: payload.serviceId,
//       deletedAt: null,
//     }).select("baseCredit");

//     // --- Step 1: Create 500 Leads ---
//     const leadsPayload = [];
//     for (let i = 0; i < totalCount; i++) {
//       leadsPayload.push({
//         userProfileId: userProfile._id,
//         countryId: payload.countryId,
//         serviceId: payload.serviceId,
//         additionalDetails: `${payload.additionalDetails} #${i + 1}`,
//         budgetAmount: payload.budgetAmount,
//         locationId: payload.locationId,
//         credit: creditInfo?.baseCredit || 0,
//         leadPriority: payload.leadPriority,
//         status:'approve'
//       });
//     }

//     const leads = await Lead.insertMany(leadsPayload, { session });

//     // --- Step 2: Create Answers for Each Lead ---
//     const leadDocs = [];
//     for (const lead of leads) {
//       for (const q of payload.questions) {
//         for (const opt of q.checkedOptionsDetails) {
//           leadDocs.push({
//             leadId: lead._id,
//             serviceId: payload.serviceId,
//             questionId: q.questionId,
//             optionId: opt.id,
//             isSelected: opt.is_checked,
//             idExtraData: opt.idExtraData || "",
//           });
//         }
//       }
//     }

//     if (leadDocs.length > 0) {
//       await LeadServiceAnswer.insertMany(leadDocs, { session });
//     }

//     await session.commitTransaction();
//     console.log(`✅ Successfully inserted ${leads.length} leads and ${leadDocs.length} answers.`);
//   } catch (error) {
//     console.error("❌ Error inserting leads:", error);
//     await session.abortTransaction();
//   } finally {
//     session.endSession();
//     await mongoose.disconnect();
//   }
// };

// CreateBulkLeads();


import mongoose, { ClientSession } from "mongoose";
import UserProfile from "../app/module/User/models/user.model";
import Lead from "../app/module/Lead/models/lead.model";
import CountryWiseServiceWiseField from "../app/module/CountryWiseMap/models/countryWiseServiceWiseFields.model";
import { LeadServiceAnswer } from "../app/module/Lead/models/leadServiceAnswer.model";

// --- MongoDB Connection ---
const MONGODB_URI =
  "mongodb+srv://tla-db:ucTzNJuV5jmerx2U@rh-dev.enoq8.mongodb.net/tlaDB?retryWrites=true&w=majority&appName=rh-dev";

// --- Interfaces ---
interface ICheckedOption {
  id: string;
  name: string;
  is_checked: boolean;
  idExtraData?: string;
}

interface IQuestion {
  step: number;
  questionId: string;
  question: string;
  order: number;
  checkedOptionsDetails: ICheckedOption[];
}

interface ILeadPayload {
  countryId: string;
  serviceId: string;
  leadPriority: string;
  additionalDetails: string;
  budgetAmount: string;
  locationId: string;
  questions: IQuestion[];
}

// --- Payload Data ---
const payload: ILeadPayload = {
  countryId: "682ecd01e6b730f229c8d3d3",
  serviceId: "682ecfbae3ebe5d62bf3c9ae",
  leadPriority: "within_a_week",
  additionalDetails: "I need this service too urgently.",
  budgetAmount: "264",
  locationId: "682ece8ae3ebe5d62bf3c989",
  questions: [
    {
      step: 1,
      questionId: "6853b5385ef7ac305b46658a",
      question: "What type of administrative law issue do you need help with?",
      order: 1,
      checkedOptionsDetails: [
        { id: "6853d40e6cc9c59ece30fc2a", name: "Visa Application", is_checked: true },
        { id: "6853d40e6cc9c59ece30fc2b", name: "Citizenship", is_checked: false },
      ],
    },
    {
      step: 2,
      questionId: "6853b5475ef7ac305b46658d",
      question: "Which authority or government department is involved?",
      order: 2,
      checkedOptionsDetails: [
        { id: "6853d40e6cc9c59ece30fc2d", name: "Home Affairs / Immigration", is_checked: true },
      ],
    },
    {
      step: 3,
      questionId: "6853b5515ef7ac305b466590",
      question: "What stage is your matter currently at?",
      order: 3,
      checkedOptionsDetails: [
        { id: "6853d40e6cc9c59ece30fc2e", name: "Initial Stage", is_checked: true },
      ],
    },
    {
      step: 4,
      questionId: "6853b55a5ef7ac305b466593",
      question: "How would you like the service to be delivered?",
      order: 4,
      checkedOptionsDetails: [
        { id: "6853d40e6cc9c59ece30fc2f", name: "Online", is_checked: true },
      ],
    },
    {
      step: 5,
      questionId: "6853d3766cc9c59ece30fc08",
      question: "When are you looking to get started?",
      order: 5,
      checkedOptionsDetails: [
        { id: "6853d40e6cc9c59ece30fc30", name: "Within a week", is_checked: true },
      ],
    },
  ],
};

const userId = "6881ef9e79930dd9530bcb73"; // Replace with a valid User ID
const totalCount = 500;

const CreateBulkLeads = async (): Promise<void> => {
  await mongoose.connect(MONGODB_URI);
  const session: ClientSession = await mongoose.startSession();

  try {
    session.startTransaction();

    const userProfile = await UserProfile.findOne({ user: userId })
      .select("_id")
      .session(session);

    if (!userProfile) {
      throw new Error("User profile not found");
    }

    const creditInfo = await CountryWiseServiceWiseField.findOne({
      countryId: payload.countryId,
      serviceId: payload.serviceId,
      deletedAt: null,
    }).select("baseCredit");

    // --- Step 1: Create Leads ---
    const leadsPayload = [];
    for (let i = 0; i < totalCount; i++) {
      leadsPayload.push({
        userProfileId: userProfile._id,
        countryId: payload.countryId,
        serviceId: payload.serviceId,
        additionalDetails: `${payload.additionalDetails} #${i + 1}`,
        budgetAmount: payload.budgetAmount,
        locationId: payload.locationId,
        credit: creditInfo?.baseCredit || 0,
        leadPriority: payload.leadPriority,
        status: "approve",
      });
    }

    const leads = await Lead.insertMany(leadsPayload, { session });

    // --- Step 2: Create Answers ---
    const leadDocs = [];
    for (const lead of leads) {
      for (const q of payload.questions) {
        for (const opt of q.checkedOptionsDetails) {
          leadDocs.push({
            leadId: lead._id,
            serviceId: payload.serviceId,
            questionId: q.questionId,
            optionId: opt.id,
            isSelected: opt.is_checked,
            idExtraData: opt.idExtraData || "",
          });
        }
      }
    }

    if (leadDocs.length > 0) {
      await LeadServiceAnswer.insertMany(leadDocs, { session });
    }

    await session.commitTransaction();
    console.log(`✅ Successfully inserted ${leads.length} leads and ${leadDocs.length} answers.`);
  } catch (error) {
    console.error("❌ Error inserting leads:", error);
    await session.abortTransaction();
  } finally {
    session.endSession();
    await mongoose.disconnect();
  }
};

CreateBulkLeads();
