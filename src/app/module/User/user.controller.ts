import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { HTTP_STATUS } from '../../constant/httpStatus';
import { UserProfileService } from './user.service';
import { TUploadedFile } from '../../interface/file.interface';
import { CompanyProfileService } from './companyProfile.service';
import { ProfilePhotosService } from './profilePhotos.service';
import { accreditationService } from './profileAccreditation.service';
import { profileSocialMediaService } from './profileSocialMedia.service';
import { profileCustomService } from './ProfileCustomService.service';
import { profileQAService } from './profileQA.service';
import { profileExperienceService } from './profileExperience.service';
import { profileFaqService } from './profileFaq.service';
import { startQueryTimer } from '../../utils/queryTimer';
import { agreementService } from './agreement.service';

/**
 * @desc   Updates the user's profile data in the database.
 * @param  {Request} req - The request object containing the user ID in params and the updated profile data in the body.
 * @param  {Response} res - The response object used to send the response back to the client.
 * @returns {Promise<void>} Sends the response with status, success message, and updated profile data.
 * @throws {AppError} Throws an error if the user profile update fails.
 */

const updateProfile = catchAsync(async (req, res) => {
  const userId = req.user.userId;
  // const parsedData = JSON.parse(req.body.data);
  const parsedData = req.body.data ? JSON.parse(req.body.data) : {};
  const files = req.files as TUploadedFile[];
  const fileMap: Record<string, TUploadedFile[]> = {};
  files.forEach((file) => {
    if (!fileMap[file.fieldname]) {
      fileMap[file.fieldname] = [];
    }
    fileMap[file.fieldname].push(file);
  });


  let userProfileResult = null;
  let companyProfileResult = null;
  let profilePhotosResult = null;
  let accreditationResult = null;
  let agreementResult = null;
  let socialMediaResult = null;
  let serviceInfoResult = null;
  let profileQAResult = null;
  let profileExperienceResult = null;
  let faqResult = null;

  if (parsedData?.userProfile) {
    userProfileResult = await UserProfileService.updateProfileIntoDB(
      userId,
      parsedData.userProfile,
      fileMap['userProfileLogo']?.[0],
    );
  }

  // if (parsedData?.companyInfo) {
  //   companyProfileResult =
  //     await CompanyProfileService.updateCompanyProfileIntoDB(
  //       userId,
  //       parsedData.companyInfo,
  //       fileMap['companyLogo']?.[0],
  //     );
  // }


  if (parsedData?.companyInfo) {

    companyProfileResult =
      await CompanyProfileService.firmRequestAsMember(
        userId,
        parsedData.companyInfo,

      );
  }



  if (parsedData?.photos) {
    profilePhotosResult = await ProfilePhotosService.updateProfilePhotosIntoDB(
      userId,
      parsedData.photos,
      fileMap['photos'],
    );
  }

  if (parsedData?.accreditationInfo) {
    accreditationResult =
      await accreditationService.updateProfileAccreditationIntoDB(
        userId,
        parsedData.accreditationInfo,
        fileMap['attachment']?.[0],
      );
  }


  if (fileMap['agreementfiles'] || fileMap['agreementfiles'] === undefined) {

    agreementResult =
      await agreementService.updateProfileAgreementIntoDB(
        userId,
        fileMap['agreementfiles']?.[0],
      );
  }


  if (parsedData?.socialMediaInfo) {
    socialMediaResult =
      await profileSocialMediaService.updateProfileSocialMediaIntoDB(
        userId,
        parsedData.socialMediaInfo,
      );
  }
  if (parsedData?.serviceInfo) {
    // Assuming profileCustomService is used for custom services
    serviceInfoResult =
      await profileCustomService.updateProfileCustomServiceIntoDB(
        userId,
        parsedData.serviceInfo,
      );
  }
  if (parsedData?.profileQA) {
    // Assuming profileCustomService is used for custom services
    profileQAResult = await profileQAService.updateProfileQAIntoDB(
      userId,
      parsedData.profileQA,
    );
  }

  if (parsedData?.experience) {
    // Assuming profileCustomService is used for custom services
    profileExperienceResult =
      await profileExperienceService.updateProfileExperienceIntoDB(
        userId,
        parsedData.experience,
      );
  }

  if (parsedData?.faq) {
    // Assuming profileCustomService is used for custom services
    faqResult = await profileFaqService.updateProfileFaqIntoDB(
      userId,
      parsedData.faq,
    );
  }

  const result =
    userProfileResult ||
    companyProfileResult ||
    profilePhotosResult ||
    accreditationResult ||
    serviceInfoResult ||
    profileQAResult ||
    profileExperienceResult ||
    socialMediaResult || agreementResult ||
    faqResult;

  if (!result) {
    return sendResponse(res, {
      statusCode: HTTP_STATUS.BAD_REQUEST,
      success: false,
      message: 'No profile data provided to update.',
      data: '',
    });
  }

  const message = userProfileResult
    ? 'User profile updated successfully.'
    : companyProfileResult
      ? 'Company profile updated successfully.'
      : accreditationResult
        ? 'Accreditation updated successfully.'
        : socialMediaResult
          ? 'Profile social media updated successfully.'
          : serviceInfoResult
            ? 'Service info updated successfully.'
            : profileExperienceResult
              ? 'Experience updated successfully.'
              : faqResult
                ? 'FAQ updated successfully.'
                : agreementResult ? 'Agreement update successfully' : 'Profile photos updated successfully.';

  return sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message,
    data: result,
  });
});

/**
 * @desc   Retrieves a single user's basic profile information from the database.
 * @param  {Request} req - The request object containing the user ID in the parameters.
 * @param  {Response} res - The response object used to send the response back to the client.
 * @returns {Promise<void>} Sends the response with status, success message, and the retrieved user profile data.
 * @throws {AppError} Throws an error if the user profile retrieval fails.
 */
const getSingleUserProfileData = catchAsync(async (req, res) => {
  // Extract the user ID from the request parameters
  const userId = req.params.userId;

  // Call the service function to retrieve the user's profile data from the database
  const result =
    await UserProfileService.getSingleUserProfileDataIntoDB(userId);

  // Send a successful response back to the client with the user's profile data
  return sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: 'Get Single User Basic Info Successfully',
    data: result,
  });
});

/**
 * @desc   Retrieves the logged-in user's basic profile information from the database.
 * @param  {Request} req - The request object containing the authenticated user data (from JWT).
 * @param  {Response} res - The response object used to send the response back to the client.
 * @returns {Promise<void>} Sends the response with status, success message, and the user's profile data.
 * @throws {AppError} Throws an error if the profile retrieval fails.
 */

const getCurrentUserInfo = catchAsync(async (req, res) => {
  const timer = startQueryTimer();
  // Extract the logged-in user information from the request (from JWT payload)
  const userId = req.user.userId;

  // Call the service function to retrieve the user's profile data from the database
  const result = await UserProfileService.getCurrentUserProfileInfoIntoDB(userId);
  const queryTime = timer.endQueryTimer();
  // Send a successful response back to the client with the user's profile data
  return sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: ' User Basic Info GET Successfully',
    queryTime,
    data: result,
  });
});

/**
 * @desc   Retrieves all user profiles from the database.
 * @param  {Request} req - The request object (no specific parameters needed for this operation).
 * @param  {Response} res - The response object used to send the response back to the client.
 * @returns {Promise<void>} Sends the response with status, success message, and the list of all user profiles.
 * @throws {AppError} Throws an error if fetching user profiles fails.
 */


const getAllUserProfile = catchAsync(async (req, res) => {
  const timer = startQueryTimer();


  const queryOptions = {
    page: Number(req.query.page) || 1,
    limit: Number(req.query.limit) || 10,
    searchTerm: req.query.search as string | undefined,      // search text
    role: req.query.role as string | undefined,            // user role filter
    regUserType: req.query.regUserType as string | undefined, // registered user type
    accountStatus: req.query.accountStatus as string | undefined, // approved, pending, rejected
    //  handle boolean parsing
    isVerifiedAccount: req.query.isVerifiedAccount === "true"
      ? true
      : req.query.isVerifiedAccount === "false"
        ? false
        : undefined,

    isPhoneVerified: req.query.isPhoneVerified === "true"
      ? true
      : req.query.isPhoneVerified === "false"
        ? false
        : undefined,

    //  sorting support
    sortBy: (req.query.sortBy as string) || "createdAt",
    sortOrder: req.query.sortOrder === "asc" ? "asc" : "desc",
  };


  const result = await UserProfileService.getAllUserIntoDB(queryOptions);
  const queryTime = timer.endQueryTimer();

  return sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: ' Get all Users Successfully',
    queryTime,
    pagination: result.meta,
    data: result.users,
  });
});

/**
 * @desc   Soft deletes a user profile based on the user ID provided in the request parameters.
 * @param  {Request} req - The request object containing the user ID as a URL parameter.
 * @param  {Response} res - The response object used to send the response back to the client.
 * @returns {Promise<void>} Sends the response with status, success message, and the result of the soft deletion.
 * @throws {AppError} Throws an error if the deletion fails or the user does not exist.
 */

const deleteSingleUserProfile = catchAsync(async (req, res) => {
  // Extract the user ID from the request parameters
  const userId = req.params.userId;

  // Call the service function to perform a soft delete on the user profile
  const result = await UserProfileService.softDeleteUserIntoDB(userId);

  // Send a successful response back to the client with the result of the deletion
  return sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: ' Delete user Successfully',
    data: result,
  });
});







export const updateDefaultProfile = catchAsync(async (req, res) => {
  const userId = req.params.userId;
  const file = req.file; // single file

  if (!file) {
    return sendResponse(res, {
      statusCode: HTTP_STATUS.OK,
      success: false,
      message: 'No file provided',
      data: null
    });
  }

  const updatedProfile = await UserProfileService.updateDefaultProfileIntoDB(
    userId,
    file
  );

  return sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: 'Profile updated successfully',
    data: updatedProfile,
  });
});






export const userProfileController = {
  updateProfile,
  getSingleUserProfileData,
  getCurrentUserInfo,
  getAllUserProfile,
  deleteSingleUserProfile,
  updateDefaultProfile
};
