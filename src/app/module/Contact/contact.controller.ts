import { HTTP_STATUS } from "../../constant/httpStatus";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { contactservice } from "./contact.service";




const sendContact = catchAsync(async (req, res) => {
  const userId = req.user?.userId;
  const payload = req.body;
  const result = await contactservice.sendContactMessage(userId, payload);

  return sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: result.message,
    data: result.data,
  });
});

const contact = catchAsync(async (req, res) => {
  const payload = req.body;
  const result = await contactservice.contactWithEmail(payload);
  return sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: result.success,
    message: result.message,
    data: null,
  });
});
const sendNotification = catchAsync(async (req, res) => {
  const payload = req.body;
  const result = await contactservice.sendNotificationService(payload);
  return sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: 'success socket',
    data: result,
  });
});






export const contactController = {
  sendContact,
  contact,
  sendNotification
};
