import { HTTP_STATUS } from '../../constant/httpStatus';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { paymentMethodService } from './paymentMethod.service';

const getPaymentMethods = catchAsync(async (req, res) => {
  const methods = await paymentMethodService.getPaymentMethods(req.user.userId);

  if (!methods) {
    return sendResponse(res, {
      statusCode: HTTP_STATUS.OK,
      success: false,
      message: 'No payment methods retrieved',
      data: null,
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

const removePaymentMethod = catchAsync(async (req, res) => {
  const { paymentMethodId } = req.params;
  const userId = req.user.userId;

  const result = await paymentMethodService.removePaymentMethod(
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

//   create setup intent
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


// create subscription setup
const createSubscription = catchAsync(async (req, res) => {
  const user = req.user;

  const result = await paymentMethodService.createSubscription(user.userId, req.body);

  return sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: result.success,
    message: result.message,
    data: result.data,
  });
});


//  subscription cancel
const cancelSubscription = catchAsync(async (req, res) => {
  const userId = req.user.userId;
  const result = await paymentMethodService.cancelSubscription(userId, req.body.type);

  return sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: result.success,
    message: result.message,
    data: result.data,
  });
});



// Change subscription package within the same type (upgrade/downgrade)
const changeSubscriptionPackage = catchAsync(async (req, res) => {
  const userId = req.user.userId;
  const result = await paymentMethodService.changeSubscriptionPackage(userId, req.body);

  return sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: result.success,
    message: result.message,
    data: result.data,
  });
});

// Switch between subscription types (cross-type change)
const switchSubscriptionType = catchAsync(async (req, res) => {
  const userId = req.user.userId;
  const result = await paymentMethodService.switchSubscriptionType(userId, req.body);

  return sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: result.success,
    message: result.message,
    data: result.data,
  });
});



const purchaseCredits = catchAsync(async (req, res) => {
  const userId = req.user.userId;
  const result = await paymentMethodService.purchaseCredits(userId, req.body);
  return sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: result.success,
    message: result.message,
    data: result.data,
  });
});









export const paymentMethodController = {
  getPaymentMethods,
  addPaymentMethod,
  createSetupIntent,
  purchaseCredits,
  removePaymentMethod,
  createSubscription,
  cancelSubscription,
  changeSubscriptionPackage,
  switchSubscriptionType

};
