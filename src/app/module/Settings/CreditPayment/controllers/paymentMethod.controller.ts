import { HTTP_STATUS } from '../../../../constant/httpStatus';
import catchAsync from '../../../../utils/catchAsync';
import sendResponse from '../../../../utils/sendResponse';
import { paymentMethodService } from '../services/paymentMethod.service';

const getPaymentMethods = catchAsync(async (req, res) => {
  const methods = await paymentMethodService.getPaymentMethods(req.user.userId);

  if (!Array.isArray(methods) || !methods.length) {
    return sendResponse(res, {
      statusCode: HTTP_STATUS.OK,
      success: false,
      message: 'No payment methods retrieved',
      data: [],
    });
  }

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
    success: result.success,
    message: result.message,
    data: result.data,
  });
});

const createSetupIntent = catchAsync(async (req, res) => {
  const user = req.user;
  const result = await paymentMethodService.createSetupIntent(
    user.userId,
    user.email,
  );
  return sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: 'Stripe setup intent created',
    data: result,
  });
});

export const paymentMethodController = {
  getPaymentMethods,
  addPaymentMethod,
  createSetupIntent,
};
