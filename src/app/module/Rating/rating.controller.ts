import { HTTP_STATUS } from "../../constant/httpStatus";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { ratingService } from "./rating.service";



const createRating = catchAsync(async (req, res) => {
  const clientId = req.user?.userId; // logged-in client
  if (!clientId) {
    return sendResponse(res, {
      statusCode: HTTP_STATUS.UNAUTHORIZED,
      success: false,
      message: "Unauthorized: Client not found",
      data: null,
    });

  }

  const { leadId, responseId, rating, feedback, lawyerId } = req.body;

  // Validate rating value
  if (!rating || rating < 1 || rating > 5) {
    return sendResponse(res, {
      statusCode: HTTP_STATUS.BAD_REQUEST,
      success: false,
      message: "Rating must be a number between 1 and 5",
      data: null,
    });
  }

  const newRating = await ratingService.createRating({
    leadId,
    responseId,
    clientId,
    rating,
    feedback,
    lawyerId
  });

  return sendResponse(res, {
    statusCode: HTTP_STATUS.CREATED,
    success: true,
    message: "Rating submitted successfully",
    data: newRating,
  });
});









const getRatingsForLawyer = catchAsync(async (req, res) => {
  const lawyerId = req.user?.userId;

  if (!lawyerId) {
    return sendResponse(res, {
      statusCode: HTTP_STATUS.UNAUTHORIZED,
      success: false,
      message: "Unauthorized: Lawyer not found",
      data: [],
    });
  }

  // Fetch ratings from DB
  const ratings = await ratingService.getRatingsForLawyer(lawyerId, req.query);

  return sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: ratings.length
      ? "Ratings retrieved successfully"
      : "No ratings found",
    data: ratings,
  });
});





export const ratingController = {
  getRatingsForLawyer,
  createRating
};
