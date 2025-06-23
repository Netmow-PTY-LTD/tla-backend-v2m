/* eslint-disable @typescript-eslint/no-explicit-any */
import mongoose from 'mongoose';
import UserProfile from '../../User/models/user.model';

import { AppError } from '../../../errors/error';
import { HTTP_STATUS } from '../../../constant/httpStatus';
import User from '../models/auth.model';

import ZipCode from '../../Country/models/zipcode.model';
import { UserLocationServiceMap } from '../../LeadSettings/models/UserLocationServiceMap.model';
import { createToken } from '../utils/auth.utils';
import config from '../../../config';
import { StringValue } from 'ms';
import { USER_ROLE } from '../../../constant';
import Lead from '../../Lead/models/lead.model';
import ServiceWiseQuestion from '../../Service/Question/models/ServiceWiseQuestion.model';
import Option from '../../Service/Option/models/option.model';
import { LeadServiceAnswer } from '../../Lead/models/leadServiceAnswer.model';

const clientRegisterUserIntoDB = async (payload: any) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { leadDetails, countryId, serviceId, questions } = payload;

    const existingUser = await User.isUserExistsByEmail(payload.email);
    if (existingUser) {
      throw new AppError(HTTP_STATUS.CONFLICT, 'This user already exists!');
    }

    const userData = {
      email: leadDetails.email,
      role: USER_ROLE.USER,
      regUserType: 'client',
      password: '123456',
    };

    const [newUser] = await User.create([userData], { session });

    const profileData = {
      user: newUser._id,
      country: countryId,
      name: leadDetails.name,
    };

    const [newProfile] = await UserProfile.create([profileData], { session });

    newUser.profile = newProfile._id;
    await newUser.save({ session });

    if (newUser.regUserType === 'client') {
      const [leadUser] = await Lead.create(
        [
          {
            userProfileId: newProfile._id,
            serviceId,
            additionalDetails: leadDetails.additionalDetails || '',
          },
        ],
        { session },
      );

      const allQuestions = await ServiceWiseQuestion.find({
        countryId,
        serviceId,
      }).lean();

      const questionIds = allQuestions.map((q) => q._id);

      const allOptions = await Option.find({
        questionId: { $in: questionIds },
        serviceId,
      })
        .lean()
        .session(session);

      const selectedMap = new Map(); // Map<questionId, Set<optionId>>
      for (const q of questions) {
        selectedMap.set(
          q.questionId,
          new Set(q.checkedOptionsDetails.map((o: any) => o.id)),
        );
      }

      const leadDocs: any[] = [];

      for (const option of allOptions) {
        const questionId = option.questionId.toString();
        const optionIdStr = option._id.toString();

        const isSelected =
          selectedMap.has(questionId) &&
          selectedMap.get(questionId).has(optionIdStr);

        let idExtraData = '';

        if (isSelected) {
          const matchedQuestion = questions.find(
            (q: any) => q.questionId === questionId,
          );
          if (matchedQuestion) {
            const matchedOptionDetail =
              matchedQuestion.checkedOptionsDetails.find(
                (opt: any) => opt.id === optionIdStr,
              );
            idExtraData = matchedOptionDetail?.idExtraData || '';
          }
        }

        leadDocs.push({
          leadId: leadUser._id,
          serviceId,
          questionId: option.questionId,
          optionId: option._id,
          isSelected,
          idExtraData,
        });
      }

      if (leadDocs.length > 0) {
        await LeadServiceAnswer.insertMany(leadDocs, { session });
      }
    }

    const locationGroup = await ZipCode.findOne({
      countryId: newProfile?.country,
      zipCodeType: 'default',
    });

    const userLocationServiceMapData = {
      userProfileId: newProfile._id,
      locationGroupId: locationGroup?._id,
      locationType: 'nation_wide',
      serviceIds: [],
    };

    await UserLocationServiceMap.create([userLocationServiceMapData], {
      session,
    });

    await session.commitTransaction();
    session.endSession();

    const jwtPayload = {
      userId: newUser._id,
      email: newUser.email,
      role: newUser.role,
      accountStatus: newUser.accountStatus,
    };

    const accessToken = createToken(
      jwtPayload,
      config.jwt_access_secret as StringValue,
      config.jwt_access_expires_in as StringValue,
    );

    const refreshToken = createToken(
      jwtPayload,
      config.jwt_refresh_secret as StringValue,
      config.jwt_refresh_expires_in as StringValue,
    );

    return {
      accessToken,
      refreshToken,
      userData: newUser,
    };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

// const clientRegisterUserIntoDB = async (payload: any) => {
//   // Start a database session for the transaction
//   const session = await mongoose.startSession();
//   session.startTransaction();

//   try {
//     // Separate the profile data from the user data
//     const { leadDetails, countryId, serviceId, questions } = payload;
//     // Check if the user already exists by email
//     const existingUser = await User.isUserExistsByEmail(payload.email);
//     if (existingUser) {
//       throw new AppError(HTTP_STATUS.CONFLICT, 'This user already exists!');
//     }

//     const userData = {
//       // username: leadDetails.username,
//       email: leadDetails.email,
//       role: USER_ROLE.USER,
//       regUserType: 'client',
//       password: '123456',
//     };
//     // Create the user document in the database
//     const [newUser] = await User.create([userData], { session });

//     // Prepare the profile data with a reference to the user
//     const profileData = {
//       user: newUser._id,
//       country: countryId,
//       name: leadDetails.name,
//     };

//     // Create the user profile document in the database
//     const [newProfile] = await UserProfile.create([profileData], { session });

//     // Link the profile to the newly created user
//     newUser.profile = newProfile._id;
//     await newUser.save({ session });

//     //  create lead user

//     if (newUser.regUserType === 'client') {
//       // Step 1: Create a new lead entry linked to the user profile and service
//       const [leadUser] = await Lead.create(
//         [
//           {
//             userProfileId: newProfile._id,
//             serviceId,
//           },
//         ],
//         { session },
//       );

//       // Step 2: Fetch all questions for the specified country and service
//       const allQuestions = await ServiceWiseQuestion.find({
//         countryId,
//         serviceId,
//       }).lean();

//       // Step 3: Extract only the question IDs from the retrieved questions
//       const questionIds = allQuestions.map((q) => q._id);

//       // Step 4: Fetch all options for the given service and those question IDs
//       const allOptions = await Option.find({
//         questionId: { $in: questionIds },
//         serviceId,
//       })
//         .lean()
//         .session(session);

//       // Step 5: Build a map of user-selected options, grouped by questionId
//       // Example: Map { 'questionId1' => Set('optionId1', 'optionId2') }
//       const selectedMap = new Map(); // Map<questionId, Set<optionId>>
//       for (const q of questions) {
//         selectedMap.set(q.questionId, new Set(q.checkedOptions));
//       }

//       // Step 6: Prepare documents to insert into the LeadServiceAnswer collection
//       // eslint-disable-next-line @typescript-eslint/no-explicit-any
//       const leadDocs: any[] = [];

//       // Step 7: Iterate over all available options and determine if each is selected by the user
//       for (const option of allOptions) {
//         const questionId = option.questionId.toString();
//         // Check if this option was selected by the user
//         const isSelected =
//           selectedMap.has(questionId) &&
//           selectedMap.get(questionId).has(option._id.toString());
//         // Step 8: Add the option with its selection status to the list of documents
//         leadDocs.push({
//           leadId: leadUser._id,
//           serviceId,
//           questionId: option.questionId,
//           optionId: option._id,
//           isSelected,
//           idExtraData: '',
//         });
//       }
//       // Step 9: Bulk insert all lead service answers into the database
//       if (leadDocs.length > 0) {
//         await LeadServiceAnswer.insertMany(leadDocs, { session });
//       }
//     }
//     //  default location map user wise
//     const locationGroup = await ZipCode.findOne({
//       countryId: newProfile?.country,
//       zipCodeType: 'default',
//     });

//     const userLocationServiceMapData = {
//       userProfileId: newProfile._id,
//       locationGroupId: locationGroup?._id,
//       locationType: 'nation_wide',
//       serviceIds: [],
//     };

//     await UserLocationServiceMap.create([userLocationServiceMapData], {
//       session,
//     });

//     // Commit the transaction (save changes to the database)
//     await session.commitTransaction();
//     session.endSession();

//     // Generate the access token for the user
//     const jwtPayload = {
//       userId: newUser._id,
//       email: newUser.email,
//       // username: newUser.username,
//       role: newUser.role,
//       accountStatus: newUser.accountStatus,
//     };

//     const accessToken = createToken(
//       jwtPayload,
//       config.jwt_access_secret as StringValue,
//       config.jwt_access_expires_in as StringValue,
//     );

//     // Generate the refresh token for the user
//     const refreshToken = createToken(
//       jwtPayload,
//       config.jwt_refresh_secret as StringValue,
//       config.jwt_refresh_expires_in as StringValue,
//     );

//     // Return the generated tokens and user data
//     return {
//       accessToken,
//       refreshToken,
//       userData: newUser,
//     };
//   } catch (error) {
//     // If an error occurs, abort the transaction to avoid incomplete data
//     await session.abortTransaction();
//     session.endSession();
//     throw error;
//   }
// };

export const clientRegisterService = {
  clientRegisterUserIntoDB,
};
