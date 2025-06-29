import { HTTP_STATUS } from '../../../constant/httpStatus';
import catchAsync from '../../../utils/catchAsync';
import sendResponse from '../../../utils/sendResponse';
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

const createCreditPackages = catchAsync(async (req, res) => {
  const result = await CreditPaymentService.createCreditPackagesIntoDB(
    req.body,
  );
  return sendResponse(res, {
    statusCode: HTTP_STATUS.CREATED,
    success: true,
    message: 'Credits Package Create Successfully',
    data: result,
  });
});
const updateCreditPackages = catchAsync(async (req, res) => {
  const creditPackageId = req.params.creditPackageId;
  const result = await CreditPaymentService.updateCreditPackagesIntoDB(
    creditPackageId,
    req.body,
  );
  return sendResponse(res, {
    statusCode: HTTP_STATUS.CREATED,
    success: true,
    message: 'Credits Package Create Successfully',
    data: result,
  });
});
// eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
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

const getAllTransactionHistory = catchAsync(async (req, res) => {
  const result = await CreditPaymentService.getAllTransactionHistory();
  return sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: 'Transaction history fetched',
    data: result,
  });
});

const getNextCreditOffer = catchAsync(async (req, res) => {
  const result = await CreditPaymentService.findNextCreditOffer(
    req.user.userId,
  );
  return sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: 'Get Next Credit Offer',
    data: result,
  });
});

export const creditPaymentController = {
  getCreditPackages,
  // purchaseCredits,
  applyCoupon,
  getBillingDetails,
  updateBillingDetails,
  createCreditPackages,
  getTransactionHistory,
  updateCreditPackages,
  getAllTransactionHistory,
  getNextCreditOffer,
};
