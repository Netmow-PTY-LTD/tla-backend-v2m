import { HTTP_STATUS } from '../../constant/httpStatus';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';

import { profileFaqService } from './profileFaq.service';

const deleteFaq = catchAsync(async (req, res) => {
  // Extract the user ID from the request parameters
  const { faqId } = req.params;

  // Call the service function to retrieve the user's profile data from the database
  const result = await profileFaqService.deleteFaqIntoDB(faqId);
  if (!result) {
    return sendResponse(res, {
      statusCode: HTTP_STATUS.OK,
      success: false,
      message: 'Faq not found',
      data: null,
    });
  }
  return sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: 'Faq Delete Successfully',
    data: result,
  });
});

export const faqController = {
  deleteFaq,
};
