import { HTTP_STATUS } from '../../constant/httpStatus';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { clientRegisterService } from './clientRegister.service';

const clientRegister = catchAsync(async (req, res) => {
  // Extract user registration data from the request body
  const payload = req.body;

  // Register the user and receive tokens along with user data
  const { accessToken, refreshToken, userData, leadUser } =
    await clientRegisterService.clientRegisterUserIntoDB(payload);

  // Store the refresh token in a secure HTTP-only cookie
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true, // Prevents client-side JavaScript from accessing the cookie
    // secure: config.NODE_ENV === 'production',
    secure: true, // Ensures the cookie is only sent over HTTPS
    sameSite: 'none', // Allows cross-site requests (must be used with HTTPS)
  });

  // Send response with access token and registered user information
  return sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: 'Client registered successfully.',
    token: accessToken,
    data: {
      userData,
      leadUser,
    },
  });
});

const clientRegistrationDraft = catchAsync(async (req, res) => {
  const payload = req.body;
  const result = await clientRegisterService.clientRegistrationDraftInDB(payload);

  // Send response with registered draft information
  return sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: 'Client registration draft saved successfully.',
    data: {
      clientDraftId: result._id,
    },
  });
});

const updateClientRegistrationDraft = catchAsync(async (req, res) => {
  const { draftId } = req.params;
  const payload = req.body;
  const result = await clientRegisterService.updateClientRegistrationDraftInDB(draftId, payload);

  return sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: 'Client registration draft updated successfully.',
    data: result,
  });
});

const verifyClientRegistrationEmail = catchAsync(async (req, res) => {
  const { draftId, code } = req.body;
  const result = await clientRegisterService.verifyClientRegistrationEmail(draftId, code);

  return sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: result.message,
    data: null
  });
});

const commitClientRegistration = catchAsync(async (req, res) => {
  const { draftId } = req.body;
  const { accessToken, refreshToken, userData, leadUser } = await clientRegisterService.commitClientRegistration(draftId);

  // Store the refresh token in a secure HTTP-only cookie
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
  });

  return sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: 'Client registration completed successfully.',
    token: accessToken,
    data: {
      userData,
      leadUser,
    },
  });
});

export const clientRegisterController = {
  clientRegister,
  clientRegistrationDraft,
  updateClientRegistrationDraft,
  verifyClientRegistrationEmail,
  commitClientRegistration,
};
