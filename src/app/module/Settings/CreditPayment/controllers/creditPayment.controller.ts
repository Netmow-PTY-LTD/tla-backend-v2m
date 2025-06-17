import { HTTP_STATUS } from '../../../../constant/httpStatus';
import catchAsync from '../../../../utils/catchAsync';
import sendResponse from '../../../../utils/sendResponse';
import { CreditPaymentService } from '../services/creditPayment.service';

const getCreditPackages = catchAsync(async (req, res) => {
  const packages = await CreditPaymentService.getCreditPackages();
  return sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: 'Credit packages retrieved successfully',
    data: packages,
  });
});

const purchaseCredits = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const result = await CreditPaymentService.purchaseCredits(userId, req.body);
  return sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: 'Credits purchased successfully',
    data: result,
  });
});

const applyCoupon = catchAsync(async (req, res) => {
  const result = await CreditPaymentService.applyCoupon(req.body.couponCode);
  sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: 'Coupon applied',
    data: result,
  });
});

const getBillingDetails = catchAsync(async (req, res) => {
  const user = await CreditPaymentService.getBillingDetails(req.user.userId);

  if (!user) {
    return sendResponse(res, {
      statusCode: HTTP_STATUS.OK,
      success: false,
      message: 'Billing details not found.',
      data: null,
    });
  }
  return sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: 'Billing details retrieved',
    data: user,
  });
});

const updateBillingDetails = catchAsync(async (req, res) => {
  const result = await CreditPaymentService.updateBillingDetails(
    req.user.userId,
    req.body,
  );

  if (!result) {
    return sendResponse(res, {
      statusCode: HTTP_STATUS.OK,
      success: false,
      message: 'Billing details not found for update.',
      data: null,
    });
  }

  return sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: 'Billing details updated successfully',
    data: result,
  });
});

const getPaymentMethods = catchAsync(async (req, res) => {
  const methods = await CreditPaymentService.getPaymentMethods(req.user.userId);
  return sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: 'Payment methods retrieved',
    data: methods,
  });
});

const addPaymentMethod = catchAsync(async (req, res) => {
  const result = await CreditPaymentService.addPaymentMethod(
    req.user.userId,
    req.body,
  );
  return sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: result ? 'Payment method added' : 'User profile not found',
    data: result,
  });
});

const getTransactionHistory = catchAsync(async (req, res) => {
  const result = await CreditPaymentService.getTransactionHistory(
    req.user.userId,
  );
  return sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: 'Transaction history fetched',
    data: result,
  });
});

export const creditPaymentController = {
  getCreditPackages,
  purchaseCredits,
  applyCoupon,
  getBillingDetails,
  updateBillingDetails,
  getPaymentMethods,
  addPaymentMethod,
  getTransactionHistory,
};
