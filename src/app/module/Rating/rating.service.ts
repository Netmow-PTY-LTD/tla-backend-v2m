
import { Types } from "mongoose";
import { Rating } from "./rating.model";
import UserProfile from "../User/models/user.model";
import LeadResponse from "../LeadResponse/response.model";
import Lead from "../Lead/lead.model";



interface CreateRatingInput {
  leadId: string;
  responseId: string;
  clientId: string;
  lawyerId: string;
  rating: number;
  feedback?: string;
}


const createRating = async (input: CreateRatingInput) => {
  const { leadId, responseId, clientId, lawyerId, rating, feedback } = input;

  // ✅ 1. Validate lawyer profile using lawyer's userId
  const lawyerProfile = await UserProfile.findOne({ user: lawyerId });
  if (!lawyerProfile) {
    throw new Error("Lawyer profile not found.");
  }

  // ✅ 2. Validate client profile using client's userId
  const clientProfile = await UserProfile.findOne({ user: clientId });
  if (!clientProfile) {
    throw new Error("Client profile not found.");
  }

  // ✅ 3. Check if this client already rated this response
  const existingRating = await Rating.findOne({
    clientId: clientProfile._id,
    responseId,
  });

  if (existingRating) {
    throw new Error("You have already rated this response.");
  }

  // ✅ 4. Create a new rating (store profile IDs, not user IDs)
  const newRating = await Rating.create({
    leadId,
    responseId,
    clientId: clientProfile._id,
    lawyerId: lawyerProfile._id,
    rating,
    feedback,
  });

  // ✅ 5. Attach rating reference to the LeadResponse document
  await LeadResponse.findByIdAndUpdate(responseId, {
    $set: { clientRating: newRating._id },
  });

  // ✅ 6. Attach rating reference to the Lead document
  await Lead.findByIdAndUpdate(leadId, {
    $set: { hiredLawyerRating: newRating._id },
  });

  // ✅ 7. Recalculate average rating for the lawyer profile
  const stats = await Rating.aggregate([
    {
      $match: {
        lawyerId: new Types.ObjectId(lawyerProfile._id),
      },
    },
    {
      $group: {
        _id: "$lawyerId",
        avgRating: { $avg: "$rating" },
        totalRatings: { $sum: 1 },
      },
    },
  ]);

  // ✅ 8. Update lawyer profile with new rating stats
  if (stats.length > 0) {
    await UserProfile.findByIdAndUpdate(lawyerProfile._id, {
      avgRating: stats[0].avgRating,
      totalRatings: stats[0].totalRatings,
    });
  } else {
    await UserProfile.findByIdAndUpdate(lawyerProfile._id, {
      avgRating: 0,
      totalRatings: 0,
    });
  }

  return newRating;
};





export const getRatingsForLawyer = async (lawyerId: string | Types.ObjectId, query: any) => {

  const filter: any = { lawyerId };

  if (query.leadId) filter.leadId = query.leadId;
  if (query.responseId) filter.responseId = query.responseId;

  const ratings = await Rating.find(filter)
    .populate({
      path: "clientId",
      select: "name profilePicture email",
    })
    .populate({
      path: "leadId",

    })
    .populate({
      path: "responseId",

    })
    .sort({ createdAt: -1 });

  return ratings;
};




export const ratingService = {
  createRating,
  getRatingsForLawyer,
};
