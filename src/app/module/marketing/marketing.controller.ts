

import HTTP_STATUS from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { marketingService } from "./marketing.service";


const lawyerRegister = catchAsync(async (req, res) => {
  // Extract user registration data from the request body
  const payload = req.body;
  const userId = req.user.userId

  // Register the user and receive tokens along with user data
  const { userData } = await marketingService.lawyerRegisterUserIntoDB(userId, payload);


  // Send response with access token and registered user information
  return sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: 'Lawyer crate successfully.',
    data: userData,
  });
});




const updateLawyer = catchAsync(async (req, res) => {
  const payload = req.body;
  const currentUserId = req.user.userId;
  const userId = req.params.id;

  const result = await marketingService.updateLawyerIntoDB(currentUserId, userId, payload);

  return sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: 'Lawyer updated successfully.',
    data: result,
  });
});


const getLawyer = catchAsync(async (req, res) => {
  const userId = req.params.id;
  const result = await marketingService.getLawyerFromDB(userId);

  return sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: 'Lawyer retrieved successfully.',
    data: result,
  });
});

const deleteLawyer = catchAsync(async (req, res) => {
  const userId = req.params.id;
  const performBy = req.user.userId;

  await marketingService.deleteLawyerFromDB(userId, performBy);

  return sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: 'Lawyer deleted successfully.',
    data: null,
  });
});

export const marketingController = {
  lawyerRegister,
  updateLawyer,
  getLawyer,
  deleteLawyer,
};
