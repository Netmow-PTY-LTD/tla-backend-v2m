/* eslint-disable @typescript-eslint/no-explicit-any */
import { JwtPayload } from 'jsonwebtoken';
import { HTTP_STATUS } from '../../constant/httpStatus';
import { AppError } from '../../errors/error';
import User from '../Auth/auth.model';
import { IUserProfile } from './user.interface';

import { deleteFromSpace, uploadToSpaces } from '../../config/upload';
import { TUploadedFile } from '../../interface/file.interface';
import UserProfile from './user.model';
import CompanyProfile from './companyProfile.model';
import ProfilePhotos from './profilePhotos';
import profileSocialMedia from './profileSocialMedia';
import { sendNotFoundResponse } from '../../errors/custom.error';
import Accreditation from './ProfileAccreditation';
import ProfileCustomService from './profileServiceCoustom.model';
import ProfileQA from './ProfileQAS';
import { PROFILE_QUESTIONS } from './profileQA.utils';
import mongoose, { Document } from 'mongoose';
import Experience from './experience.model';
import Faq from './faq.model';
import Agreement from './agreement.model';
import { FOLDERS } from '../../constant';
import { redisClient } from '../../config/redis.config';


/**
 * @desc   Retrieves all users from the database, including their associated profile data.
 * @returns  Returns an array of users, each with populated profile data.
 */


const getAllUserIntoDB = async (query: Record<string, any>) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;
  const searchTerm = query.searchTerm || '';
  const sortBy = query.sortBy || 'createdAt';
  const sortOrder = query.sortOrder === 'asc' ? 1 : -1;




  // Build filters dynamically
  const filters: any = {};
  if (query.role) filters.role = query.role;
  if (query.regUserType) filters.regUserType = query.regUserType;
  if (query.accountStatus) filters.accountStatus = query.accountStatus;
  if (query.isVerifiedAccount !== undefined) filters.isVerifiedAccount = query.isVerifiedAccount;
  if (query.isPhoneVerified !== undefined) filters.isPhoneVerified = query.isPhoneVerified;






  // Aggregation pipeline
  const pipeline: any[] = [
    { $match: filters },

    // Lookup profile
    {
      $lookup: {
        from: 'userprofiles',
        localField: 'profile',
        foreignField: '_id',
        as: 'profile',
      },
    },
    { $unwind: { path: '$profile', preserveNullAndEmptyArrays: true } },

    // Lookup nested serviceIds inside profile
    {
      $lookup: {
        from: 'services',
        localField: 'profile.serviceIds',
        foreignField: '_id',
        as: 'profile.serviceIds',
      },
    },

    // Search on email and profile.name
    {
      $match: {
        $or: [
          { email: { $regex: searchTerm, $options: 'i' } },
          { 'profile.name': { $regex: searchTerm, $options: 'i' } },
          { 'profile.phone': { $regex: searchTerm, $options: 'i' } },
          { 'profile.address': { $regex: searchTerm, $options: 'i' } },
        ],
      },
    },

    // Sorting
    { $sort: { [sortBy]: sortOrder } },

    // Pagination
    { $skip: skip },
    { $limit: limit },
  ];

  // Execute aggregation
  const users = await User.aggregate(pipeline);

  // Total count for pagination
  const countPipeline = [
    { $match: filters },
    {
      $lookup: {
        from: 'userprofiles',
        localField: 'profile',
        foreignField: '_id',
        as: 'profile',
      },
    },
    { $unwind: { path: '$profile', preserveNullAndEmptyArrays: true } },
    {
      $match: {
        $or: [
          { email: { $regex: searchTerm, $options: 'i' } },
          { 'profile.name': { $regex: searchTerm, $options: 'i' } },
          { 'profile.phone': { $regex: searchTerm, $options: 'i' } },
          { 'profile.address': { $regex: searchTerm, $options: 'i' } },
        ],
      },
    },
    { $count: 'total' },
  ];

  const totalResult = await User.aggregate(countPipeline);
  const total = totalResult[0]?.total || 0;
  const totalPage = Math.ceil(total / limit);

  const result = {
    users,
    meta: {
      page,
      limit,
      total,
      totalPage,
    },
  };



  return result;




};












/**
 * @desc   Updates the profile of a user in the database.
 * @param  {string} id - The ID of the user whose profile is to be updated.
 * @param  {Partial<IUserProfile>} payload - The profile data to be updated.
 * @returns  Returns the updated profile data.
 * @throws {AppError} Throws an error if the user does not exist or the profile cannot be updated.
 */
// const updateProfileIntoDB = async (
//   userId: string,
//   payload: Partial<IUserProfile>,
//   file?: TUploadedFile,
// ) => {
//   // ✅ Handle file upload if provided
//   if (file?.buffer) {
//     try {
//       // const uploadedUrl = await uploadToSpaces(
//       //   file.buffer,
//       //   file.originalname,
//       //   userId,
//       //   // 'avatars', // optional folder name
//       // );
//       const uploadedUrl = await uploadToSpaces(file.buffer as Buffer, file.originalname, {
//         folder: FOLDERS.PROFILES,
//         entityId: `user_${userId}`,
//       });
//       payload.profilePicture = uploadedUrl;
//       // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
//     } catch (err) {
//       throw new AppError(
//         HTTP_STATUS.INTERNAL_SERVER_ERROR,
//         'File upload failed',
//       );
//     }
//   }

//   // Update the user's profile in the database
//   const updatedProfile = await UserProfile.findOneAndUpdate(
//     { user: userId },
//     payload,
//     {
//       new: true, // Return the updated document
//       runValidators: true, // Run schema validation before saving
//     },
//   );

//   // Return the updated profile
//   return updatedProfile;
// };



const updateProfileIntoDB = async (
  userId: string,
  payload: Partial<IUserProfile>,
  file?: TUploadedFile
) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  let newFileUrl: string | null = null;

  try {
    // Step 1: Fetch existing profile
    const existingProfile = await UserProfile.findOne({ user: userId }).session(session);
    if (!existingProfile) throw new AppError(HTTP_STATUS.NOT_FOUND, 'User profile not found');

    // Step 2: Handle file upload (if new file provided)
    if (file?.buffer) {
      const fileBuffer = file.buffer;
      const originalName = file.originalname;

      // Upload new file to DigitalOcean Spaces
      newFileUrl = await uploadToSpaces(fileBuffer, originalName, {
        folder: FOLDERS.PROFILES,
        entityId: `user_${userId}`,
      });

      // Attach new URL to payload
      payload.profilePicture = newFileUrl;
    }

    // Step 3: Update DB record inside transaction
    const updatedProfile = await UserProfile.findOneAndUpdate(
      { user: userId },
      payload,
      {
        new: true,
        runValidators: true,
        session,
      }
    );

    if (!updatedProfile) throw new AppError(HTTP_STATUS.BAD_REQUEST, 'Failed to update profile');

    // Step 4: Commit DB transaction
    await session.commitTransaction();
    session.endSession();

    // Step 5: Delete old file after successful update
    if (file?.buffer && existingProfile.profilePicture) {
      deleteFromSpace(existingProfile.profilePicture).catch((err) =>
        console.error(' Failed to delete old profile picture:', err)
      );
    }

    return updatedProfile;
  } catch (err) {
    // Rollback DB transaction
    await session.abortTransaction();
    session.endSession();

    // Rollback uploaded file if DB transaction failed
    if (newFileUrl) {
      deleteFromSpace(newFileUrl).catch((cleanupErr) =>
        console.error(' Failed to rollback uploaded file:', cleanupErr)
      );
    }

    throw err;
  }
};









/**
 * @desc   Retrieves the profile data of a single user from the database, including user and profile details.
 * @param  {string} id - The ID of the user whose profile data is to be retrieved.
 * @returns Returns the user's basic information along with their profile data.
 * @throws {AppError} Throws an error if the user does not exist.
 */

const getSingleUserProfileDataIntoDB = async (userId: string) => {

  // ----------------------- CACHE KEY -----------------------
  const cacheKey = `user_profile:${userId}`;

  // ----------------------- CHECK CACHE -----------------------
  const cachedData = await redisClient.get(cacheKey);
  if (cachedData) {
    console.log('✅ Cache hit:', cacheKey);
    return JSON.parse(cachedData);
  }




  // 1. Find the user by ID with profile + serviceIds populated
  const userData = await User.findById(userId)
    .populate({
      path: 'profile',
      model: 'UserProfile',
      populate: {
        path: 'serviceIds',
        model: 'Service', // adjust model name if different
      },
    })
    .exec();

  if (!userData || !userData.profile || typeof userData.profile === 'string') {
    return sendNotFoundResponse('user or profile not found');
  }

  const userProfileId = userData.profile._id;

  // 2. Fetch models that point to the UserProfile
  const [
    companyProfile,
    accreditation,
    photos,
    socialMedia,
    customService,
    profileQAAnswers,
    experience,
    faq,
    agreement,
  ] = await Promise.all([
    CompanyProfile.findOne({ userProfileId }).select('+_id'),
    Accreditation.find({ userProfileId }).select('+_id'),
    ProfilePhotos.findOne({ userProfileId }).select('+_id'),
    profileSocialMedia.findOne({ userProfileId }).select('+_id'),
    ProfileCustomService.find({ userProfileId }).select('+_id'),
    ProfileQA.find({ userProfileId }),
    Experience.findOne({ userProfileId }).select('+_id'),
    Faq.find({ userProfileId }).select('+_id'),
    Agreement.findOne({ userProfileId }).select('+_id'),
  ]);

  // 3. Convert to plain object to remove Mongoose internals
  const plainUser = userData.toObject();
  const plainProfile = (
    userData.profile as unknown as Document & { toObject: () => any }
  ).toObject();

  // 4. Map the answers to question labels
  const sortedQA = PROFILE_QUESTIONS.map((q) => {
    const match = profileQAAnswers.find((item) => item.question === q);
    return {
      question: q,
      answer: match?.answer || '',
    };
  });

  // 5. Add nested profile data
  plainUser.profile = {
    ...plainProfile,
    companyProfile,
    customService,
    photos,
    socialMedia,
    accreditation,
    profileQA: sortedQA,
    experience,
    faq,
    agreement,
  };


  const finalUser = plainUser;

  // ----------------------- CACHE RESULT -----------------------
  await redisClient.set(cacheKey, JSON.stringify(finalUser), { EX: 60 * 60 }); // cache for 1 hour



  return finalUser;
};








/**
 * @desc   Retrieves the profile data of a user from the database based on the JWT payload.
 * @param  {JwtPayload} user - The JWT payload containing the user ID and other details.
 * @returns  Returns the user's basic information along with their profile data.
 * @throws {AppError} Throws an error if the user does not exist.
 */



 const getCurrentUserProfileInfoIntoDB = async (userId:string) => {
  // 1. Check if user exists
  const isUserExists = await User.isUserExists(userId);
  if (!isUserExists) {
    return sendNotFoundResponse('user does not exist');
  }


  // ----------------------- CACHE KEY -----------------------
  const cacheKey = `user_info:${userId}`;

  // ----------------------- CHECK CACHE -----------------------
  const cachedData = await redisClient.get(cacheKey);
  if (cachedData) {
    console.log(' Cache hit:', cacheKey);
    return JSON.parse(cachedData);
  }






  // 2. Get the user + profile
  const userData = await User.findById(userId)
    .populate({
      path: 'profile',
      model: 'UserProfile',
      populate: [
        {
          path: 'serviceIds',
          model: 'Service', // or whatever your actual model name is
        },

        {
          path: 'firmProfileId',
          model: 'FirmProfile',
          populate: {
            path: 'contactInfo.country contactInfo.city contactInfo.zipCode',
          },
        },
        {
          path: 'activeFirmRequestId',
          model: 'LawyerRequestAsMember',
          populate: { path: 'firmProfileId', select: 'firmName' },
        },
        {
          path: 'subscriptionId',
          model: 'UserSubscription',
          populate: { path: 'subscriptionPackageId' },
        },
        {
          path: 'eliteProSubscriptionId',
          model: 'EliteProUserSubscription',
          populate: { path: 'eliteProPackageId' },
        },
      ],
    })


  if (!userData || !userData.profile || typeof userData.profile === 'string') {
    return sendNotFoundResponse('user profile data not found');
  }

  const userProfileId = userData.profile._id;

  // 3. Fetch models that point to the UserProfile
  const [
    companyProfile,
    accreditation,
    photos,
    socialMedia,
    customService,
    profileQAAnswers,
    experience,
    faq,
    agreement
  ] = await Promise.all([
    CompanyProfile.findOne({ userProfileId: userProfileId }).select('+_id '),
    Accreditation.find({ userProfileId: userProfileId }).select('+_id '),
    ProfilePhotos.findOne({ userProfileId: userProfileId }).select('+_id '),
    profileSocialMedia
      .findOne({ userProfileId: userProfileId })
      .select('+_id '),
    ProfileCustomService.find({ userProfileId: userProfileId }).select('+_id '),
    ProfileQA.find({ userProfileId }), // ← fetch all Q&A
    Experience.findOne({ userProfileId: userProfileId }).select('+_id '),
    Faq.find({ userProfileId: userProfileId }).select('+_id '),
    Agreement.findOne({ userProfileId: userProfileId }).select('+_id '),
  ]);

  // 4. Convert to plain object to remove Mongoose internals
  const plainUser = userData.toObject();
  // const plainProfile = userData?.profile?.toObject();
  const plainProfile = (
    userData.profile as unknown as Document & { toObject: () => any }
  ).toObject();

  // Optional: Map the answers to question labels (sorted as in PROFILE_QUESTIONS)
  const sortedQA = PROFILE_QUESTIONS.map((q) => {
    const match = profileQAAnswers.find((item) => item.question === q);
    return {
      question: q,
      answer: match?.answer || '',
    };
  });

  // 5. Add nested profile data
  plainUser.profile = {
    ...plainProfile,
    companyProfile,
    customService,
    photos,
    socialMedia,
    accreditation,
    profileQA: sortedQA,
    experience,
    faq,
    agreement
  };



  // ----------------------- CACHE RESULT -----------------------
  await redisClient.set(cacheKey, JSON.stringify(plainUser), { EX: 60 * 60 }); // cache for 1 hour








  return plainUser;
};



//   cache user data api
export const getCurrentUserProfileInfoFromCache = async (userId:string) => {
  // 1. Check if user exists
  const isUserExists = await User.isUserExists(userId);
  if (!isUserExists) {
    return sendNotFoundResponse('user does not exist');
  }


  // ----------------------- CACHE KEY -----------------------
  const cacheKey = `user_info:${userId}`;

  // ----------------------- CHECK CACHE -----------------------
  const cachedData = await redisClient.get(cacheKey);
  if (cachedData) {
    console.log(' Cache hit:', cacheKey);
    // return JSON.parse(cachedData);

    return;
  }



  // 2. Get the user + profile
  const userData = await User.findById(userId)
    .populate({
      path: 'profile',
      model: 'UserProfile',
      populate: [
        {
          path: 'serviceIds',
          model: 'Service', // or whatever your actual model name is
        },

        {
          path: 'firmProfileId',
          model: 'FirmProfile',
          populate: {
            path: 'contactInfo.country contactInfo.city contactInfo.zipCode',
          },
        },
        {
          path: 'activeFirmRequestId',
          model: 'LawyerRequestAsMember',
          populate: { path: 'firmProfileId', select: 'firmName' },
        },
        {
          path: 'subscriptionId',
          model: 'UserSubscription',
          populate: { path: 'subscriptionPackageId' },
        },
        {
          path: 'eliteProSubscriptionId',
          model: 'EliteProUserSubscription',
          populate: { path: 'eliteProPackageId' },
        },
      ],
    })


  if (!userData || !userData.profile || typeof userData.profile === 'string') {
    return sendNotFoundResponse('user profile data not found');
  }

  const userProfileId = userData.profile._id;

  // 3. Fetch models that point to the UserProfile
  const [
    companyProfile,
    accreditation,
    photos,
    socialMedia,
    customService,
    profileQAAnswers,
    experience,
    faq,
    agreement
  ] = await Promise.all([
    CompanyProfile.findOne({ userProfileId: userProfileId }).select('+_id '),
    Accreditation.find({ userProfileId: userProfileId }).select('+_id '),
    ProfilePhotos.findOne({ userProfileId: userProfileId }).select('+_id '),
    profileSocialMedia
      .findOne({ userProfileId: userProfileId })
      .select('+_id '),
    ProfileCustomService.find({ userProfileId: userProfileId }).select('+_id '),
    ProfileQA.find({ userProfileId }), // ← fetch all Q&A
    Experience.findOne({ userProfileId: userProfileId }).select('+_id '),
    Faq.find({ userProfileId: userProfileId }).select('+_id '),
    Agreement.findOne({ userProfileId: userProfileId }).select('+_id '),
  ]);

  // 4. Convert to plain object to remove Mongoose internals
  const plainUser = userData.toObject();
  // const plainProfile = userData?.profile?.toObject();
  const plainProfile = (
    userData.profile as unknown as Document & { toObject: () => any }
  ).toObject();

  // Optional: Map the answers to question labels (sorted as in PROFILE_QUESTIONS)
  const sortedQA = PROFILE_QUESTIONS.map((q) => {
    const match = profileQAAnswers.find((item) => item.question === q);
    return {
      question: q,
      answer: match?.answer || '',
    };
  });

  // 5. Add nested profile data
  plainUser.profile = {
    ...plainProfile,
    companyProfile,
    customService,
    photos,
    socialMedia,
    accreditation,
    profileQA: sortedQA,
    experience,
    faq,
    agreement
  };



  // ----------------------- CACHE RESULT -----------------------
  await redisClient.set(cacheKey, JSON.stringify(plainUser), { EX: 60 * 60 }); // cache for 1 hour





 
};







/**
 * @desc   Soft deletes a user and their associated profile in the database by marking them as deleted.
 * @param  {string} id - The ID of the user to be soft deleted.
 * @returns  Returns a success message along with the user ID.
 * @throws {AppError} Throws an error if the user does not exist or if there is a problem during the transaction.
 */
export const softDeleteUserIntoDB = async (id: string) => {
  // Start a new session for the transaction
  const session = await mongoose.startSession();

  try {
    // Begin the transaction
    session.startTransaction();

    // Check if the user exists in the database
    const isUserExists = await User.isUserExists(id);
    if (!isUserExists) {
      throw new AppError(HTTP_STATUS.NOT_FOUND, 'User does not exist');
    }

    // Define the deletion timestamp
    const deletedAt = new Date();

    // Soft delete the user by setting  adding the deletedAt timestamp
    await User.findByIdAndUpdate(id, { deletedAt: deletedAt }, { session });

    // Soft delete the user's profile with the same method
    await UserProfile.findOneAndUpdate(
      { user: id },
      { deletedAt: deletedAt },
      { session },
    );

    // Commit the transaction
    await session.commitTransaction();
    session.endSession();

    // Return a success message along with the user ID
    return {
      message: 'User and profile soft-deleted successfully',
      userId: id,
    };
  } catch (error) {
    // Abort the transaction in case of an error
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};





const updateDefaultProfileIntoDB = async (
  userId: string,
  file: Express.Multer.File
) => {


  if (!file?.buffer) {
    throw new AppError(HTTP_STATUS.BAD_REQUEST, 'Invalid file');
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  let newFileUrl: string | null = null;

  try {
    // Step 1️: Find existing user profile
    const userProfile = await UserProfile.findOne({ user: userId }).session(session);
    if (!userProfile) {
      throw new AppError(HTTP_STATUS.NOT_FOUND, 'User profile not found');
    }

    const oldFileUrl = userProfile.profilePicture;

    // Step 2️: Upload new file
    const fileBuffer = file.buffer;
    const originalName = file.originalname;

    newFileUrl = await uploadToSpaces(fileBuffer, originalName, {
      folder: FOLDERS.PROFILES,
      entityId: `user_${userId}`,
    });

    // Step 3️: Update DB record inside transaction
    userProfile.profilePicture = newFileUrl;
    await userProfile.save({ session });


    // Step 4️: Commit transaction
    await session.commitTransaction();
    session.endSession();

    // Step 5️: Delete old file asynchronously (non-blocking)
    if (oldFileUrl) {

      deleteFromSpace(oldFileUrl).catch((err) =>
        console.error('⚠️ Failed to delete old profile image:', err)
      );
    }

    return userProfile;
  } catch (err) {
    // Rollback transaction
    await session.abortTransaction();
    session.endSession();

    // Rollback uploaded file if DB update failed
    if (newFileUrl) {
      deleteFromSpace(newFileUrl).catch((cleanupErr) =>
        console.error('⚠️ Failed to rollback uploaded file:', cleanupErr)
      );
    }

    throw err;
  }
};













export const UserProfileService = {
  updateProfileIntoDB,
  getSingleUserProfileDataIntoDB,
  getCurrentUserProfileInfoIntoDB,
  getAllUserIntoDB,
  softDeleteUserIntoDB,
  updateDefaultProfileIntoDB
};

