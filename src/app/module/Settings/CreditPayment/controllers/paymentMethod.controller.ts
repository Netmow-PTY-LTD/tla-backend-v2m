import { HTTP_STATUS } from '../../../../constant/httpStatus';
import catchAsync from '../../../../utils/catchAsync';
import sendResponse from '../../../../utils/sendResponse';
import { paymentMethodService } from '../services/paymentMethod.service';

const getPaymentMethods = catchAsync(async (req, res) => {
  const methods = await paymentMethodService.getPaymentMethods(req.user.userId);
  return sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: 'Payment methods retrieved',
    data: methods,
  });
});

const addPaymentMethod = catchAsync(async (req, res) => {
  const { paymentMethodId } = req.body;
  const userId = req.user.userId;

  const result = await paymentMethodService.addPaymentMethod(
    userId,
    paymentMethodId,
  );

  return sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: result.data ? 'Card saved successfully' : result.message,
    data: result,
  });
});

// const addPaymentMethod = catchAsync(async (req, res) => {
//   const result = await paymentMethodService.addPaymentMethod(
//     req.user.userId,
//     req.body,
//   );
//   return sendResponse(res, {
//     statusCode: HTTP_STATUS.OK,
//     success: true,
//     message: result ? 'Payment method added' : 'User profile not found',
//     data: result,
//   });
// });

export const paymentMethodController = {
  getPaymentMethods,
  addPaymentMethod,
};
