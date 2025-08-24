
import { Types } from "mongoose";
import { Rating } from "../models/rating.model";

interface CreateOrUpdateRatingInput {
  leadId: string | Types.ObjectId;
  responseId: string | Types.ObjectId;
  clientId: string | Types.ObjectId;
  lawyerId: string | Types.ObjectId;
  rating: number;
  feedback?: string;
}


export const createOrUpdateRating = async (input: CreateOrUpdateRatingInput) => {
  const { leadId, responseId, clientId,lawyerId, rating, feedback } = input;

  // Upsert: If client already rated this response, update it
  const updatedRating = await Rating.findOneAndUpdate(
    { clientId, responseId }, // query
    { leadId, rating, feedback, lawyerId}, // update fields
    { new: true, upsert: true, setDefaultsOnInsert: true } // create if not exists
  );

  return updatedRating;
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
  createOrUpdateRating,
  getRatingsForLawyer,
};
