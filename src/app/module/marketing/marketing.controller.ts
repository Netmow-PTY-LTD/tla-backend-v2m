

import HTTP_STATUS from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { marketingService } from "./marketing.service";


const lawyerRegister = catchAsync(async (req, res) => {
  // Extract user registration data from the request body
  const payload = req.body;
  const userId=req.user.userId

  // Register the user and receive tokens along with user data
  const { userData } =await marketingService.lawyerRegisterUserIntoDB(userId,payload);


  // Send response with access token and registered user information
  return sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: 'Lawyer crate successfully.',
    data: userData,
  });
});



export const marketingController = {
 lawyerRegister
};
