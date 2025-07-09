import { HTTP_STATUS } from "../../../constant/httpStatus";
import catchAsync from "../../../utils/catchAsync";
import sendResponse from "../../../utils/sendResponse";
import { contactservice } from "../services/contact.service";




const sendContact = catchAsync(async (req, res) => {
  const userProfileId = req.user?.userProfileId;
  const payload = req.body;

  const result = await  contactservice.sendContactMessage(userProfileId, payload);

  return sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: result.message,
    data: result.data,
  });
});



export const contactController = {
    sendContact
};
